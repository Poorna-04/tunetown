import { describe, expect, it } from 'vitest';
import reducer, {
  cartCleared,
  itemAdded,
  itemRemoved,
  quantityChanged,
  wishlistToggled,
} from './shoppingSlice';

describe('shopping state', () => {
  it('adds a product once and increases its quantity without exceeding stock', () => {
    let state = reducer(undefined, itemAdded({ productId: 'guitar-1', stock: 3 }));
    state = reducer(state, itemAdded({ productId: 'guitar-1', quantity: 5, stock: 3 }));

    expect(state.cart).toEqual([{ productId: 'guitar-1', quantity: 3 }]);
  });

  it('changes and removes the requested cart row by product id', () => {
    let state = reducer(undefined, itemAdded({ productId: 'guitar-1', stock: 8 }));
    state = reducer(state, itemAdded({ productId: 'piano-1', stock: 8 }));
    state = reducer(state, quantityChanged({ productId: 'piano-1', quantity: 4 }));
    state = reducer(state, itemRemoved('guitar-1'));

    expect(state.cart).toEqual([{ productId: 'piano-1', quantity: 4 }]);
  });

  it('toggles wishlist membership immediately', () => {
    const added = reducer(undefined, wishlistToggled('guitar-1'));
    const removed = reducer(added, wishlistToggled('guitar-1'));

    expect(added.wishlist).toEqual(['guitar-1']);
    expect(removed.wishlist).toEqual([]);
  });

  it('clears the cart after a successful order', () => {
    const withItem = reducer(undefined, itemAdded({ productId: 'guitar-1', stock: 3 }));
    expect(reducer(withItem, cartCleared()).cart).toEqual([]);
  });
});
