import { describe, expect, it } from 'vitest';
import products from './products.json';

const requiredCategories = [
  'Guitars',
  'Keyboards',
  'Percussion',
  'Indian classical',
  'Studio audio',
  'Accessories',
];

const requiredFields = [
  'id',
  'title',
  'description',
  'category',
  'brand',
  'price',
  'rating',
  'stock',
  'specs',
  'thumbnail',
  'images',
];

describe('product dataset', () => {
  it('contains 60 complete products across all required categories', () => {
    expect(products).toHaveLength(60);
    expect(new Set(products.map((product) => product.id)).size).toBe(60);
    expect(new Set(products.map((product) => product.category))).toEqual(
      new Set(requiredCategories),
    );

    for (const product of products) {
      expect(Object.keys(product)).toEqual(expect.arrayContaining(requiredFields));
      expect(product.thumbnail).toMatch(/^\/images\/products\//);
      expect(product.images.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('contains the edge cases required by the brief', () => {
    expect(products.some((product) => product.stock === 0)).toBe(true);
    expect(products.some((product) => product.discountPercentage === 0)).toBe(true);
    expect(products.some((product) => !Object.hasOwn(product, 'discountPercentage'))).toBe(true);
    expect(products.some((product) => product.title.length > 80)).toBe(true);
    expect(products.some((product) => product.thumbnail.includes('missing-image'))).toBe(true);
    expect(products.some((product) => product.price === 19.99)).toBe(true);
    expect(products.some((product) => product.price === 1299.5)).toBe(true);
  });
});
