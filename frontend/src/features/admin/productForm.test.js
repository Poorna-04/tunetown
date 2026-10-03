import { describe, expect, it } from 'vitest';
import {
  formatSpecifications,
  parseSpecifications,
  readProductForm,
  validateProduct,
} from './productForm';

describe('store-manager product form', () => {
  it('converts simple Key: Value specification lines in both directions', () => {
    const specifications = parseSpecifications('Material: Wood\nSize: Full: 40 inches');

    expect(specifications).toEqual({ Material: 'Wood', Size: 'Full: 40 inches' });
    expect(formatSpecifications(specifications)).toBe('Material: Wood\nSize: Full: 40 inches');
  });

  it('reads numbers and validates every required product field', () => {
    const form = new FormData();
    form.set('title', 'Student Guitar');
    form.set('description', 'A simple starter instrument.');
    form.set('category', 'Guitars');
    form.set('brand', 'Melodia');
    form.set('price', '2500');
    form.set('discountPercentage', '10');
    form.set('rating', '4.5');
    form.set('stock', '8');
    form.set('specs', 'Strings: 6');

    const product = readProductForm(form);

    expect(product).toMatchObject({ price: 2500, discountPercentage: 10, rating: 4.5, stock: 8 });
    expect(
      validateProduct(product, new File(['image'], 'guitar.png', { type: 'image/png' }), false),
    ).toEqual({});
  });

  it('reports field-specific errors and requires an image for a new product', () => {
    const errors = validateProduct(
      {
        title: '',
        description: '',
        category: '',
        brand: '',
        price: -1,
        rating: 6,
        stock: 1.5,
        specs: {},
      },
      null,
      false,
    );

    expect(errors).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        price: expect.any(String),
        rating: expect.any(String),
        stock: expect.any(String),
        specs: expect.any(String),
        image: expect.any(String),
      }),
    );
  });

  it('does not treat empty required number fields as zero', () => {
    const product = readProductForm(new FormData());
    const errors = validateProduct(product, null, false);

    expect(errors).toEqual(
      expect.objectContaining({
        price: expect.any(String),
        rating: expect.any(String),
        stock: expect.any(String),
      }),
    );
  });
});
