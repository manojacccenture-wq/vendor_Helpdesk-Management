import { createSlice } from '@reduxjs/toolkit';
import { fetchProfileThunk } from './thunks.js';

const initialState = {
  profile: {
    username: '',
    name: '',
    userCode: '',
    email: ''
  },
  role: null,
  departments: [],
  permissions: {
    hasAccessJmr: false,
    hasAccessBilling: false,
    hasAccessRetention: false
  },
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        
        if (action.payload) {
          state.isAuthenticated = action.payload.isAuthenticated || false;
          state.role = action.payload.role || null;
          state.profile = {
            username: action.payload.username || '',
            name: action.payload.name || '',
            userCode: action.payload.userCode || '',
            email: action.payload.email || ''
          };
          state.departments = action.payload.userDepartments || [];
          state.permissions = {
            hasAccessJmr: action.payload.hasAccessJmr || false,
            hasAccessBilling: action.payload.hasAccessBilling || false,
            hasAccessRetention: action.payload.hasAccessRetention || false
          };
        }
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Failed to load profile';
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
