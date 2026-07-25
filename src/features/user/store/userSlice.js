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
        
        let payload = action.payload;
        
        // Defend against stringified JSON (Missing Content-Type header)
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch(e) {}
        }
        
        // Defend against standard API envelopes (e.g., axios response object leaking or custom envelope)
        if (payload && payload.data) {
          payload = payload.data;
        }

        // Defend against the new nested API response structure where profile is inside "user"
        if (payload && payload.user) {
          payload = payload.user;
        } else if (payload && payload.User) {
          payload = payload.User;
        }

        if (payload) {
          // Defend against .NET PascalCase serialization & property name mismatch
          state.isAuthenticated = payload.isAuthenticated ?? payload.IsAuthenticated ?? payload.authenticated ?? false;
          state.role = payload.role ?? payload.Role ?? null;
          state.profile = {
            username: payload.username ?? payload.Username ?? '',
            name: payload.name ?? payload.Name ?? '',
            userCode: payload.userCode ?? payload.UserCode ?? '',
            email: payload.email ?? payload.Email ?? ''
          };
          state.departments = payload.userDepartments ?? payload.UserDepartments ?? payload.departments ?? [];
          state.permissions = {
            hasAccessJmr: payload.hasAccessJmr ?? payload.HasAccessJmr ?? false,
            hasAccessBilling: payload.hasAccessBilling ?? payload.HasAccessBilling ?? false,
            hasAccessRetention: payload.hasAccessRetention ?? payload.HasAccessRetention ?? false
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
