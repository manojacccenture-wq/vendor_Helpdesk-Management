import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer.js';

const middleware = (getDefaultMiddleware) => {
  const middlewares = getDefaultMiddleware();
  // We can push redux-logger here later if installed
  return middlewares;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware,
  devTools: import.meta.env.DEV, // Enables Redux DevTools only in dev mode
});
