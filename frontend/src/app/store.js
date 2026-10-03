import { configureStore } from '@reduxjs/toolkit';
import catalogueReducer from '../features/catalogue/catalogueSlice';
import shoppingReducer from '../features/shopping/shoppingSlice';
import uiReducer from '../features/ui/uiSlice';
import { shoppingPersistenceMiddleware } from './shoppingPersistenceMiddleware';

/**
 * The Redux store is the central shared memory of my application. I divided 
 * it into catalogue, shopping, and UI state so that each section has one clear
 * responsibility.
 * The Redux store starts small and gains feature reducers with each module.
 * Keeping store creation in one file makes its ownership easy to explain.
 */
export const store = configureStore({
  reducer: {
    catalogue: catalogueReducer,
    shopping: shoppingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shoppingPersistenceMiddleware),
});
