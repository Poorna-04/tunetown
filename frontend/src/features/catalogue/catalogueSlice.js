import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { getCategories, getProduct, getProducts } from '../../services/dataService';

const productsAdapter = createEntityAdapter();

const initialState = productsAdapter.getInitialState({
  listIds: [],
  categories: [],
  total: 0,
  status: 'idle',
  error: '',
  activeRequestId: null,
});

const minimumLoadingTime = () => new Promise((resolve) => window.setTimeout(resolve, 1500));

/** Load the visible result, categories, and complete small catalogue together. */
export const loadCatalogue = createAsyncThunk('catalogue/load', async (query) => {
  const [result, categories, allProductsResult] = await Promise.all([
    getProducts(query),
    getCategories(),
    getProducts({ limit: 1000 }),
    minimumLoadingTime(),
  ]);

  return { ...result, categories, allProducts: allProductsResult.products };
});

/** Refresh visible products without replacing the grid with loading skeletons. */
export const refreshCatalogue = createAsyncThunk('catalogue/refresh', async (query) => {
  const [result, categories, allProductsResult] = await Promise.all([
    getProducts(query),
    getCategories(),
    getProducts({ limit: 1000 }),
  ]);
  return { ...result, categories, allProducts: allProductsResult.products };
});

/** Fetch a direct product URL only when the product is not already cached. */
export const loadProduct = createAsyncThunk('catalogue/loadProduct', async (id) => getProduct(id), {
  condition: (id, { getState }) => !getState().catalogue.entities[id],
});

/** Reload a product after a manager changes it in this or another tab. */
export const refreshProduct = createAsyncThunk('catalogue/refreshProduct', async (id) =>
  getProduct(id),
);

const catalogueSlice = createSlice({
  name: 'catalogue',
  initialState,
  reducers: {
    stockUpdated(state, action) {
      const product = state.entities[action.payload.id];
      if (product) product.stock = action.payload.stock;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalogue.pending, (state, action) => {
        state.status = 'loading';
        state.error = '';
        state.activeRequestId = action.meta.requestId;
      })
      .addCase(loadCatalogue.fulfilled, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return;
        productsAdapter.upsertMany(state, action.payload.allProducts);
        state.listIds = action.payload.products.map(({ id }) => id);
        state.categories = action.payload.categories;
        state.total = action.payload.total;
        state.status = 'succeeded';
        state.activeRequestId = null;
      })
      .addCase(loadCatalogue.rejected, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.error = action.error.message || 'Products could not be loaded.';
        state.activeRequestId = null;
      })
      .addCase(loadProduct.fulfilled, (state, action) => {
        productsAdapter.upsertOne(state, action.payload);
      })
      .addCase(refreshCatalogue.fulfilled, (state, action) => {
        productsAdapter.setAll(state, action.payload.allProducts);
        state.listIds = action.payload.products.map(({ id }) => id);
        state.categories = action.payload.categories;
        state.total = action.payload.total;
        state.status = 'succeeded';
      })
      .addCase(refreshProduct.fulfilled, (state, action) => {
        productsAdapter.upsertOne(state, action.payload);
      });
  },
});

export const { stockUpdated } = catalogueSlice.actions;
export const productSelectors = productsAdapter.getSelectors((state) => state.catalogue);
export default catalogueSlice.reducer;
