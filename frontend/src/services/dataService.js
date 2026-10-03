import initialProducts from '../data/products.json';
import { addServiceCall, getServiceSettings } from './serviceConfig';
import { publishServiceEvent } from './serviceEvents';
import { clearTuneTownStorage, readStoredValue, writeStoredValue } from './storageAdapter';

const emptyCollections = Object.freeze({
  orders: [],
  reviews: [],
  addresses: [],
  cart: [],
  wishlist: [],
  recentlyViewed: [],
});

const defaultPreferences = Object.freeze({ theme: 'system', deliveryPin: '' });
const defaultSession = Object.freeze({ role: 'shopper', shopperId: 'local-shopper' });
const arrayValidator = (value) => Array.isArray(value);
const objectValidator = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

let randomSource = Math.random;

export class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

function clone(value) {
  return structuredClone(value);
}

function createId(prefix, length = 8) {
  const value = crypto.randomUUID().replaceAll('-', '').slice(0, length).toUpperCase();
  return `${prefix}-${value}`;
}

function createOrderId(orders) {
  let id;
  do id = createId('ORD', 6);
  while (orders.some((order) => order.id === id));
  return id;
}

function readProducts() {
  return readStoredValue('products', initialProducts, arrayValidator);
}

function readCollection(key) {
  return readStoredValue(key, emptyCollections[key], arrayValidator);
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

/** Keep developer logs useful without copying complete product or order collections. */
function summarizeResult(result) {
  if (Array.isArray(result)) return `Array(${result.length})`;
  if (result?.products && Array.isArray(result.products)) {
    return `{ products: Array(${result.products.length}), total: ${result.total} }`;
  }
  if (result && typeof result === 'object') return `{ ${Object.keys(result).join(', ')} }`;
  return String(result);
}

/**
 * Give every public operation the same remote-like delay, failure, and logging
 * behavior. Operation-specific failure rates remain active when they are higher.
 */
async function runOperation(name, args, operation, options = {}) {
  const startedAt = performance.now();
  const { minDelay, maxDelay, failureRate, hasRuntimeOverride } = getServiceSettings();
  const randomDelay = Math.round(minDelay + randomSource() * (maxDelay - minDelay));
  const delay =
    !hasRuntimeOverride && options.defaultDelay != null ? options.defaultDelay : randomDelay;

  await wait(delay);

  try {
    if (!options.skipFailure && randomSource() < Math.max(failureRate, options.failureRate ?? 0)) {
      throw new ServiceError(500, 'The local service is temporarily unavailable.');
    }

    const result = await operation();
    addServiceCall({
      name,
      args: clone(args),
      duration: Math.round(performance.now() - startedAt),
      status: 'success',
      result: summarizeResult(result),
    });
    return clone(result);
  } catch (error) {
    const serviceError =
      error instanceof ServiceError ? error : new ServiceError(500, error.message);
    addServiceCall({
      name,
      args: clone(args),
      duration: Math.round(performance.now() - startedAt),
      status: 'error',
      errorStatus: serviceError.status,
      result: serviceError.message,
    });
    throw serviceError;
  }
}

function requireProduct(products, id) {
  const product = products.find((candidate) => candidate.id === id);
  if (!product) throw new ServiceError(404, `Product ${id} was not found.`);
  return product;
}

function requireManager() {
  const session = readStoredValue('session', defaultSession, objectValidator);
  if (session.role !== 'manager') {
    throw new ServiceError(403, 'Store-manager access is required.');
  }
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase();
}

function applyProductQuery(products, options) {
  const {
    q = '',
    category,
    brands = [],
    minRating,
    minPrice,
    maxPrice,
    sort = 'relevance',
  } = options;
  const query = normalizeText(q);

  const filtered = products.filter((product) => {
    const searchableText =
      `${product.title} ${product.brand} ${product.description}`.toLocaleLowerCase();
    return (
      (!query || searchableText.includes(query)) &&
      (!category || product.category === category) &&
      (!brands.length || brands.includes(product.brand)) &&
      (minRating == null || product.rating >= Number(minRating)) &&
      (minPrice == null || product.price >= Number(minPrice)) &&
      (maxPrice == null || product.price <= Number(maxPrice))
    );
  });

  const sorters = {
    'price-asc': (left, right) => left.price - right.price,
    'price-desc': (left, right) => right.price - left.price,
    rating: (left, right) => right.rating - left.rating,
    newest: (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  };

  return sorters[sort] ? [...filtered].sort(sorters[sort]) : filtered;
}

export function getProducts(options = {}) {
  return runOperation('getProducts', options, () => {
    const skip = Math.max(0, Number(options.skip ?? 0));
    const limit = Math.max(1, Number(options.limit ?? 12));
    const matches = applyProductQuery(readProducts(), options);
    return { products: matches.slice(skip, skip + limit), total: matches.length };
  });
}

export function getProduct(id) {
  return runOperation('getProduct', { id }, () => requireProduct(readProducts(), id));
}

export function getCategories() {
  return runOperation('getCategories', {}, () => [
    ...new Set(readProducts().map(({ category }) => category)),
  ]);
}

export function getStock(id) {
  return runOperation('getStock', { id }, () => {
    const product = requireProduct(readProducts(), id);
    return { id, stock: product.stock };
  });
}

export function reserveStock(id, quantity) {
  return runOperation(
    'reserveStock',
    { id, quantity },
    () => {
      const product = requireProduct(readProducts(), id);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
        throw new ServiceError(409, `Only ${product.stock} units are available.`);
      }
      return { ok: true };
    },
    { failureRate: 0.3, defaultDelay: 300 },
  );
}

export function placeOrder(order) {
  return runOperation(
    'placeOrder',
    { order },
    () => {
      if (!order?.items?.length) throw new ServiceError(409, 'The order has no items.');

      const orders = readCollection('orders');
      const duplicate =
        order.submissionId &&
        orders.find(({ submissionId }) => submissionId === order.submissionId);
      if (duplicate) return { orderId: duplicate.id, placedAt: duplicate.placedAt };

      const products = readProducts();
      const shortages = [];

      for (const item of order.items) {
        const product = products.find(({ id }) => id === item.productId);
        if (
          !product ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > product.stock
        ) {
          shortages.push(item.productId);
        }
      }

      if (shortages.length) {
        throw new ServiceError(409, `Insufficient stock for: ${shortages.join(', ')}.`);
      }

      for (const item of order.items) {
        const product = products.find(({ id }) => id === item.productId);
        product.stock -= item.quantity;
      }

      const placedAt = new Date().toISOString();
      const savedOrder = {
        ...clone(order),
        id: createOrderId(orders),
        placedAt,
        cancelledAt: null,
      };
      writeStoredValue('products', products);
      writeStoredValue('orders', [savedOrder, ...orders]);
      publishServiceEvent('products');
      publishServiceEvent('orders');
      return { orderId: savedOrder.id, placedAt };
    },
    { failureRate: 1 / 3, defaultDelay: 2000 },
  );
}

export function getOrders() {
  return runOperation('getOrders', {}, () =>
    readCollection('orders').sort(
      (left, right) => new Date(right.placedAt) - new Date(left.placedAt),
    ),
  );
}

export function cancelOrder(id) {
  return runOperation('cancelOrder', { id }, () => {
    const orders = readCollection('orders');
    const order = orders.find((candidate) => candidate.id === id);
    if (!order) throw new ServiceError(404, `Order ${id} was not found.`);
    if (order.cancelledAt) return order;
    if (Date.now() - new Date(order.placedAt).getTime() > 60_000) {
      throw new ServiceError(409, 'The cancellation window has closed.');
    }

    const products = readProducts();
    for (const item of order.items) {
      const product = products.find(({ id: productId }) => productId === item.productId);
      if (product) product.stock += item.quantity;
    }

    order.cancelledAt = new Date().toISOString();
    writeStoredValue('orders', orders);
    writeStoredValue('products', products);
    publishServiceEvent('orders');
    publishServiceEvent('products');
    return order;
  });
}

export function getReviews(productId) {
  return runOperation('getReviews', { productId }, () => {
    requireProduct(readProducts(), productId);
    return readCollection('reviews')
      .filter((review) => review.productId === productId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  });
}

export function addReview(productId, review) {
  return runOperation('addReview', { productId, review }, () => {
    requireProduct(readProducts(), productId);
    const reviews = readCollection('reviews');
    const session = readStoredValue('session', defaultSession, objectValidator);
    if (
      reviews.some((item) => item.productId === productId && item.shopperId === session.shopperId)
    ) {
      throw new ServiceError(409, 'You have already reviewed this product.');
    }

    const savedReview = {
      ...clone(review),
      id: createId('REV'),
      productId,
      shopperId: session.shopperId,
      createdAt: new Date().toISOString(),
    };
    writeStoredValue('reviews', [savedReview, ...reviews]);
    publishServiceEvent('reviews');
    return savedReview;
  });
}

export function getAddresses() {
  return runOperation('getAddresses', {}, () => readCollection('addresses'));
}

export function createAddress(address) {
  return runOperation('createAddress', { address }, () => {
    const addresses = readCollection('addresses');
    const savedAddress = { ...clone(address), id: createId('ADDR') };
    writeStoredValue('addresses', [...addresses, savedAddress]);
    publishServiceEvent('addresses');
    return savedAddress;
  });
}

export function updateAddress(id, updates) {
  return runOperation('updateAddress', { id, updates }, () => {
    const addresses = readCollection('addresses');
    const index = addresses.findIndex((address) => address.id === id);
    if (index < 0) throw new ServiceError(404, `Address ${id} was not found.`);
    addresses[index] = { ...addresses[index], ...clone(updates), id };
    writeStoredValue('addresses', addresses);
    publishServiceEvent('addresses');
    return addresses[index];
  });
}

export function deleteAddress(id) {
  return runOperation('deleteAddress', { id }, () => {
    const addresses = readCollection('addresses');
    const address = addresses.find((candidate) => candidate.id === id);
    if (!address) throw new ServiceError(404, `Address ${id} was not found.`);
    writeStoredValue(
      'addresses',
      addresses.filter((candidate) => candidate.id !== id),
    );
    publishServiceEvent('addresses');
    return address;
  });
}

export function createProduct(product) {
  return runOperation('createProduct', { product }, () => {
    requireManager();
    const products = readProducts();
    const savedProduct = {
      ...clone(product),
      id: product.id || createId('PRODUCT'),
      createdAt: new Date().toISOString(),
    };
    if (products.some(({ id }) => id === savedProduct.id)) {
      throw new ServiceError(409, `Product ${savedProduct.id} already exists.`);
    }
    writeStoredValue('products', [...products, savedProduct]);
    publishServiceEvent('products');
    return savedProduct;
  });
}

export function updateProduct(id, updates) {
  return runOperation('updateProduct', { id, updates }, () => {
    requireManager();
    const products = readProducts();
    const index = products.findIndex((product) => product.id === id);
    if (index < 0) throw new ServiceError(404, `Product ${id} was not found.`);
    products[index] = { ...products[index], ...clone(updates), id };
    writeStoredValue('products', products);
    publishServiceEvent('products');
    return products[index];
  });
}

export function deleteProduct(id) {
  return runOperation('deleteProduct', { id }, () => {
    requireManager();
    const products = readProducts();
    const product = requireProduct(products, id);
    writeStoredValue(
      'products',
      products.filter((candidate) => candidate.id !== id),
    );
    publishServiceEvent('products');
    return product;
  });
}

export function getCart() {
  return runOperation('getCart', {}, () => readCollection('cart'));
}

export function saveCart(cart) {
  return runOperation('saveCart', { cart }, () => {
    writeStoredValue('cart', cart);
    publishServiceEvent('cart');
    return cart;
  });
}

export function getWishlist() {
  return runOperation('getWishlist', {}, () => readCollection('wishlist'));
}

export function saveWishlist(wishlist) {
  return runOperation('saveWishlist', { wishlist }, () => {
    writeStoredValue('wishlist', wishlist);
    publishServiceEvent('wishlist');
    return wishlist;
  });
}

export function getPreferences() {
  return runOperation('getPreferences', {}, () =>
    readStoredValue('preferences', defaultPreferences, objectValidator),
  );
}

export function savePreferences(preferences) {
  return runOperation('savePreferences', { preferences }, () => {
    const current = readStoredValue('preferences', defaultPreferences, objectValidator);
    const saved = { ...defaultPreferences, ...current, ...clone(preferences) };
    writeStoredValue('preferences', saved);
    publishServiceEvent('preferences');
    return saved;
  });
}

export function getSession() {
  return runOperation('getSession', {}, () =>
    readStoredValue('session', defaultSession, objectValidator),
  );
}

export function saveSession(session) {
  return runOperation('saveSession', { session }, () => {
    const savedSession = { ...defaultSession, ...clone(session) };
    writeStoredValue('session', savedSession);
    publishServiceEvent('session');
    return savedSession;
  });
}

export function getCheckoutDraft() {
  return runOperation('getCheckoutDraft', {}, () =>
    readStoredValue('checkout-draft', {}, objectValidator),
  );
}

function safeCheckoutDraft(draft) {
  const safeDraft = clone(draft);
  delete safeDraft.cardNumber;
  delete safeDraft.expiry;
  delete safeDraft.cvv;
  return safeDraft;
}

export function saveCheckoutDraft(draft) {
  const safeDraft = safeCheckoutDraft(draft);
  return runOperation('saveCheckoutDraft', { draft: safeDraft }, () => {
    writeStoredValue('checkout-draft', safeDraft);
    return safeDraft;
  });
}

export function getRecentlyViewed() {
  return runOperation('getRecentlyViewed', {}, () => readCollection('recentlyViewed'));
}

export function saveRecentlyViewed(productIds) {
  return runOperation('saveRecentlyViewed', { productIds }, () => {
    const uniqueIds = [...new Set(productIds)].slice(0, 5);
    writeStoredValue('recentlyViewed', uniqueIds);
    return uniqueIds;
  });
}

export function resetAllData() {
  return runOperation(
    'resetAllData',
    {},
    () => {
      clearTuneTownStorage();
      writeStoredValue('products', initialProducts);
      publishServiceEvent('reset');
      return { ok: true };
    },
    { skipFailure: true },
  );
}

/** Tests replace randomness so delays and simulated failures remain deterministic. */
export function setRandomSourceForTests(source = Math.random) {
  randomSource = source;
}
