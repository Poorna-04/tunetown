import { saveCart, saveWishlist } from '../services/dataService';
import { addToast } from '../features/ui/uiSlice';
import { wishlistReplaced } from '../features/shopping/shoppingSlice';

let cartSave = Promise.resolve();
let wishlistSave = Promise.resolve();

/** Persist shopping changes while keeping reducers synchronous and easy to test. */
export const shoppingPersistenceMiddleware = (store) => (next) => (action) => {
  const previousWishlist = store.getState().shopping?.wishlist ?? [];
  const result = next(action);

  if (action.type.startsWith('shopping/') && !action.type.endsWith('/hydrate/fulfilled')) {
    const { cart, wishlist } = store.getState().shopping;

    if (
      [
        'shopping/itemAdded',
        'shopping/quantityChanged',
        'shopping/itemRemoved',
        'shopping/cartCleared',
      ].includes(action.type)
    ) {
      cartSave = cartSave
        .catch(() => {})
        .then(() => saveCart(cart))
        .catch(() =>
          store.dispatch(addToast({ message: 'Cart could not be saved.', type: 'error' })),
        );
    }

    if (action.type === 'shopping/wishlistToggled') {
      wishlistSave = wishlistSave
        .catch(() => {})
        .then(() => saveWishlist(wishlist))
        .catch(() => {
          if (store.getState().shopping.wishlist === wishlist) {
            store.dispatch(wishlistReplaced(previousWishlist));
          }
          store.dispatch(addToast({ message: 'Wishlist could not be saved.', type: 'error' }));
        });
    }
  }

  return result;
};
