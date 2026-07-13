import { createSelector } from '@reduxjs/toolkit';

const selectUserState = (state) => state.user;

export const selectUserProfile = createSelector(
  [selectUserState],
  (userState) => userState.profile
);

export const selectUserRole = createSelector(
  [selectUserState],
  (userState) => userState.role
);

export const selectUserPermissions = createSelector(
  [selectUserState],
  (userState) => userState.permissions
);

export const selectUserDepartments = createSelector(
  [selectUserState],
  (userState) => userState.departments
);

export const selectAuthStatus = createSelector(
  [selectUserState],
  (userState) => ({
    isAuthenticated: userState.isAuthenticated,
    initialized: userState.initialized,
    loading: userState.loading,
    error: userState.error
  })
);
