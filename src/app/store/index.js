import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer.js';

import { apiSlice } from '../../shared/api/apiSlice.js';

const middleware = (getDefaultMiddleware) => {
  const middlewares = getDefaultMiddleware();
  // We can push redux-logger here later if installed
  return middlewares.concat(apiSlice.middleware);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware,
  devTools: import.meta.env.DEV, // Enables Redux DevTools only in dev mode
});
