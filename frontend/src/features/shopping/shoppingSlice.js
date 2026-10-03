import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCart, getWishlist } from '../../services/dataService';

export const hydrateShopping = createAsyncThunk('shopping/hydrate', async () => {
  const [cart, wishlist] = await Promise.all([getCart(), getWishlist()]);
  return { cart, wishlist };
});

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: {
    cart: [],
    wishlist: [],
    hydrated: false,
  },
  reducers: {
    itemAdded(state, action) {
      const { productId, quantity = 1, stock = Infinity } = action.payload;
      const item = state.cart.find((entry) => entry.productId === productId);
      if (item) item.quantity = Math.min(stock, item.quantity + quantity);
      else state.cart.push({ productId, quantity: Math.min(stock, quantity) });
    },
    quantityChanged(state, action) {
      const item = state.cart.find((entry) => entry.productId === action.payload.productId);
      if (item) item.quantity = action.payload.quantity;
    },
    itemRemoved(state, action) {
      state.cart = state.cart.filter((entry) => entry.productId !== action.payload);
    },
    cartCleared(state) {
      state.cart = [];
    },
    wishlistToggled(state, action) {
      const productId = action.payload;
      state.wishlist = state.wishlist.includes(productId)
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
    },
    wishlistReplaced(state, action) {
      state.wishlist = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateShopping.fulfilled, (state, action) => {
      state.cart = action.payload.cart;
      state.wishlist = action.payload.wishlist;
      state.hydrated = true;
    });
  },
});

export const {
  itemAdded,
  quantityChanged,
  itemRemoved,
  cartCleared,
  wishlistToggled,
  wishlistReplaced,
} = shoppingSlice.actions;
export default shoppingSlice.reducer;
