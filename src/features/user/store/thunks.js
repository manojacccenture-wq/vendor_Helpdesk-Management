import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../api/userApi.js';

export const fetchProfileThunk = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userApi.getProfile();
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
