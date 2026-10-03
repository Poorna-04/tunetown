import { beforeEach, describe, expect, it } from 'vitest';
import {
  ServiceError,
  addReview,
  cancelOrder,
  createAddress,
  createProduct,
  deleteAddress,
  getAddresses,
  getProduct,
  getProducts,
  getPreferences,
  getStock,
  placeOrder,
  reserveStock,
  resetAllData,
  saveCheckoutDraft,
  savePreferences,
  saveSession,
  setRandomSourceForTests,
  updateAddress,
  updateProduct,
} from './dataService';
import { clearServiceCalls, getServiceSnapshot, updateServiceSettings } from './serviceConfig';

beforeEach(async () => {
  window.localStorage.clear();
  clearServiceCalls();
  updateServiceSettings({ minDelay: 0, maxDelay: 0, failureRate: 0 });
  setRandomSourceForTests(() => 0.99);
  await resetAllData();
});

describe('catalogue service', () => {
  it('searches, filters, sorts, and paginates products', async () => {
    const result = await getProducts({
      q: 'guitar',
      category: 'Guitars',
      sort: 'price-asc',
      limit: 3,
    });

    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result.products).toHaveLength(3);
    expect(result.products.every(({ category }) => category === 'Guitars')).toBe(true);
    expect(result.products[0].price).toBeLessThanOrEqual(result.products[1].price);
  });

  it('rejects an unknown product with status 404', async () => {
    await expect(getProduct('missing-product')).rejects.toMatchObject({ status: 404 });
  });

  it('falls back safely when stored catalogue data is malformed', async () => {
    window.localStorage.setItem('tunetown:v1:products', '{not valid JSON');

    await expect(getProducts({ limit: 100 })).resolves.toMatchObject({ total: 60 });
  });

  it('rejects calls with a simulated status 500 failure', async () => {
    updateServiceSettings({ minDelay: 0, maxDelay: 0, failureRate: 1 });

    await expect(getProducts()).rejects.toEqual(
      expect.objectContaining({ name: 'ServiceError', status: 500 }),
    );
  });

  it('applies the required reservation failure behavior', async () => {
    setRandomSourceForTests(() => 0);
    await expect(reserveStock('guitars-002', 1)).rejects.toMatchObject({ status: 500 });
  });

  it('allows catalogue writes only for the manager role', async () => {
    const product = {
      title: 'Test Instrument',
      description: 'Created by the service test.',
      category: 'Accessories',
      brand: 'Swara',
      price: 999,
      rating: 4,
      stock: 5,
      specs: { Type: 'Test' },
      thumbnail: '/images/products/fallback.svg',
      images: ['/images/products/fallback.svg'],
    };

    await expect(createProduct(product)).rejects.toMatchObject({ status: 403 });
    await saveSession({ role: 'manager' });
    await expect(createProduct(product)).resolves.toMatchObject({ title: 'Test Instrument' });
  });

  it('restores the original JSON catalogue during reset', async () => {
    await saveSession({ role: 'manager' });
    const original = await getProduct('guitars-002');
    await updateProduct(original.id, { title: 'Changed for reset test' });

    await resetAllData();

    await expect(getProduct(original.id)).resolves.toMatchObject({ title: original.title });
  });
});

describe('orders and stock', () => {
  it('places an order once, reduces stock, and returns the same result for a duplicate submission', async () => {
    const before = await getStock('guitars-002');
    const order = {
      submissionId: 'checkout-001',
      items: [{ productId: 'guitars-002', quantity: 1, price: 1773.5 }],
    };

    const first = await placeOrder(order);
    const duplicate = await placeOrder(order);
    const after = await getStock('guitars-002');

    expect(first.orderId).toMatch(/^ORD-[A-Z0-9]{6}$/);
    expect(duplicate).toEqual(first);
    expect(after.stock).toBe(before.stock - 1);
  });

  it('rejects insufficient stock with status 409', async () => {
    await expect(
      placeOrder({
        submissionId: 'checkout-short-stock',
        items: [{ productId: 'guitars-001', quantity: 1, price: 1336.25 }],
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('restores stock when an order is cancelled inside the allowed window', async () => {
    const before = await getStock('guitars-002');
    const placed = await placeOrder({
      submissionId: 'checkout-cancel',
      items: [{ productId: 'guitars-002', quantity: 1, price: 1773.5 }],
    });

    await cancelOrder(placed.orderId);
    await expect(getStock('guitars-002')).resolves.toEqual(before);
  });
});

describe('reviews, addresses, and safe drafts', () => {
  it('merges preference updates so theme and delivery PIN do not overwrite each other', async () => {
    await savePreferences({ theme: 'dark' });
    await savePreferences({ deliveryPin: '560001' });

    await expect(getPreferences()).resolves.toEqual({ theme: 'dark', deliveryPin: '560001' });
  });

  it('allows only one review per shopper and product', async () => {
    const review = { rating: 5, title: 'Excellent', text: '<strong>Kept as text</strong>' };

    await expect(addReview('guitars-002', review)).resolves.toMatchObject(review);
    await expect(addReview('guitars-002', review)).rejects.toMatchObject({ status: 409 });
  });

  it('creates, updates, lists, and deletes addresses', async () => {
    const created = await createAddress({ name: 'Asha', city: 'Kochi', pin: '682001' });
    const updated = await updateAddress(created.id, { city: 'Thrissur' });

    expect(updated.city).toBe('Thrissur');
    await expect(getAddresses()).resolves.toContainEqual(updated);
    await deleteAddress(created.id);
    await expect(getAddresses()).resolves.toEqual([]);
  });

  it('removes all card fields before persisting a checkout draft', async () => {
    const result = await saveCheckoutDraft({
      name: 'Asha',
      cardNumber: '1111222233334444',
      expiry: '12/30',
      cvv: '123',
    });

    expect(result).toEqual({ name: 'Asha' });
    expect(window.localStorage.getItem('tunetown:v1:checkout-draft')).not.toContain(
      '1111222233334444',
    );
    expect(JSON.stringify(getServiceSnapshot().calls)).not.toContain('1111222233334444');
  });

  it('uses ServiceError for expected failures', () => {
    const error = new ServiceError(404, 'Missing');
    expect(error).toMatchObject({ name: 'ServiceError', status: 404, message: 'Missing' });
  });
});
