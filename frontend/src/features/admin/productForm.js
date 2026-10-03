export function parseSpecifications(value) {
  return Object.fromEntries(
    String(value)
      .split('\n')
      .map((line) => line.split(':'))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...rest]) => [key.trim(), rest.join(':').trim()])
      .filter(([key, specification]) => key && specification),
  );
}

export function formatSpecifications(specifications = {}) {
  return Object.entries(specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function readRequiredNumber(formData, name) {
  const value = String(formData.get(name) ?? '').trim();
  return value ? Number(value) : Number.NaN;
}

export function readProductForm(formData) {
  const product = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    brand: String(formData.get('brand') ?? '').trim(),
    price: readRequiredNumber(formData, 'price'),
    discountPercentage: Number(formData.get('discountPercentage') || 0),
    rating: readRequiredNumber(formData, 'rating'),
    stock: readRequiredNumber(formData, 'stock'),
    specs: parseSpecifications(formData.get('specs')),
  };
  if (!product.discountPercentage) delete product.discountPercentage;
  return product;
}

export function validateProduct(product, imageFile, hasExistingImage) {
  const errors = {};
  if (!product.title) errors.title = 'Enter a product title.';
  if (!product.description) errors.description = 'Enter a description.';
  if (!product.category) errors.category = 'Enter a category.';
  if (!product.brand) errors.brand = 'Enter a brand.';
  if (!Number.isFinite(product.price) || product.price < 0)
    errors.price = 'Enter a price of zero or more.';
  if (
    product.discountPercentage != null &&
    (!Number.isFinite(product.discountPercentage) ||
      product.discountPercentage < 0 ||
      product.discountPercentage > 100)
  )
    errors.discountPercentage = 'Enter a discount from 0 to 100.';
  if (!Number.isFinite(product.rating) || product.rating < 1 || product.rating > 5)
    errors.rating = 'Enter a rating from 1 to 5.';
  if (!Number.isInteger(product.stock) || product.stock < 0)
    errors.stock = 'Enter a whole stock quantity of zero or more.';
  if (!Object.keys(product.specs).length) errors.specs = 'Add at least one Key: Value line.';
  if (!hasExistingImage && !imageFile?.size) errors.image = 'Choose a product image.';
  if (imageFile?.size && !imageFile.type.startsWith('image/'))
    errors.image = 'Choose an image file.';
  return errors;
}
