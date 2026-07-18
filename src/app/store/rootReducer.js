import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../../features/user/store/userSlice.js';
import { apiSlice } from '../../shared/api/apiSlice.js';

export const rootReducer = combineReducers({
  user: userReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});
