import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import shoppingReducer, { itemAdded, wishlistToggled } from '../features/shopping/shoppingSlice';
import uiReducer from '../features/ui/uiSlice';
import { saveCart, saveWishlist } from '../services/dataService';
import { shoppingPersistenceMiddleware } from './shoppingPersistenceMiddleware';

vi.mock('../services/dataService', () => ({
  getCart: vi.fn(),
  getWishlist: vi.fn(),
  saveCart: vi.fn(),
  saveWishlist: vi.fn(),
}));

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function createStore() {
  return configureStore({
    reducer: { shopping: shoppingReducer, ui: uiReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(shoppingPersistenceMiddleware),
  });
}

describe('shopping persistence middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves cart updates in dispatch order', async () => {
    const firstSave = deferred();
    saveCart.mockImplementationOnce(() => firstSave.promise).mockResolvedValue(undefined);
    const store = createStore();

    store.dispatch(itemAdded({ productId: 'guitar-1' }));
    store.dispatch(itemAdded({ productId: 'piano-1' }));

    await vi.waitFor(() => expect(saveCart).toHaveBeenCalledTimes(1));
    firstSave.resolve();
    await vi.waitFor(() => expect(saveCart).toHaveBeenCalledTimes(2));

    expect(saveCart.mock.calls).toEqual([
      [[{ productId: 'guitar-1', quantity: 1 }]],
      [
        [
          { productId: 'guitar-1', quantity: 1 },
          { productId: 'piano-1', quantity: 1 },
        ],
      ],
    ]);
  });

  it('saves wishlist updates in dispatch order', async () => {
    const firstSave = deferred();
    saveWishlist.mockImplementationOnce(() => firstSave.promise).mockResolvedValue(undefined);
    const store = createStore();

    store.dispatch(wishlistToggled('guitar-1'));
    store.dispatch(wishlistToggled('piano-1'));

    await vi.waitFor(() => expect(saveWishlist).toHaveBeenCalledTimes(1));
    firstSave.resolve();
    await vi.waitFor(() => expect(saveWishlist).toHaveBeenCalledTimes(2));

    expect(saveWishlist.mock.calls).toEqual([[['guitar-1']], [['guitar-1', 'piano-1']]]);
  });
});
