export const formatRupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
}).format;

export function discountedPrice(product) {
  return product.price * (1 - (product.discountPercentage ?? 0) / 100);
}

export function deliveryDate(from = new Date()) {
  const date = new Date(from);
  let workingDays = 0;
  while (workingDays < 3) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) workingDays += 1;
  }
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}
