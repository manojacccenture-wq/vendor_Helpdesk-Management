export const TokenService = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => localStorage.setItem('access_token', token),
  clearToken: () => localStorage.removeItem('access_token'),
  
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token) => localStorage.setItem('refresh_token', token),
  clearRefreshToken: () => localStorage.removeItem('refresh_token'),
  
  clearAll: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
