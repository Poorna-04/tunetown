import { describe, expect, it } from 'vitest';
import reducer, { loadCatalogue } from './catalogueSlice';

const result = (id) => ({
  products: [{ id }],
  allProducts: [{ id }],
  categories: ['Test'],
  total: 1,
});

describe('catalogue request order', () => {
  it('ignores an older search result that finishes after the latest result', () => {
    let state = reducer(undefined, loadCatalogue.pending('old-request', { q: 'guitar' }));
    state = reducer(state, loadCatalogue.pending('new-request', { q: 'tabla' }));
    state = reducer(
      state,
      loadCatalogue.fulfilled(result('tabla-1'), 'new-request', { q: 'tabla' }),
    );
    state = reducer(
      state,
      loadCatalogue.fulfilled(result('guitar-1'), 'old-request', { q: 'guitar' }),
    );

    expect(state.listIds).toEqual(['tabla-1']);
  });
});
