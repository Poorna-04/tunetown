import { discountedPrice } from './format';

export function calculateOrderTotals(rows) {
  const subtotal = rows.reduce(
    (sum, { product, quantity }) => sum + discountedPrice(product) * quantity,
    0,
  );
  const savings = rows.reduce(
    (sum, { product, quantity }) => sum + (product.price - discountedPrice(product)) * quantity,
    0,
  );
  const gst = subtotal * 0.18;
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 49;
  return { subtotal, savings, gst, shipping, grandTotal: subtotal + gst + shipping };
}

export function createOrderItems(rows) {
  return rows.map(({ product, quantity }) => ({
    productId: product.id,
    title: product.title,
    brand: product.brand,
    thumbnail: product.thumbnail,
    quantity,
    price: discountedPrice(product),
    originalPrice: product.price,
    discountPercentage: product.discountPercentage ?? 0,
  }));
}

export function getOrderStatusIndex(placedAt, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(placedAt).getTime());
  return Math.min(3, Math.floor(elapsed / 20_000));
}

export function getCancellationSeconds(placedAt, now = Date.now()) {
  const elapsedSeconds = Math.floor(Math.max(0, now - new Date(placedAt).getTime()) / 1000);
  return Math.max(0, 60 - elapsedSeconds);
}
