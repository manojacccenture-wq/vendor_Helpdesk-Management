export const handleApiError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Global error mapping
    switch (status) {
      case 400:
        console.error('Bad Request', data);
        break;
      case 401:
        // Handled by the refresh token interceptor
        console.error('Unauthorized. Action required.');
        break;
      case 403:
        console.error('Forbidden. You do not have access to this resource.');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Internal Server Error. Try again later.');
        break;
      default:
        console.error('An unexpected error occurred');
    }
  } else if (error.request) {
    console.error('Network Error. Please check your connection.', error.request);
  } else {
    console.error('Error setting up the request', error.message);
  }
  
  return Promise.reject(error);
};
