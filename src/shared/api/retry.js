export const withRetry = async (apiCall, retries = 3, delay = 1000) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries === 0) throw error;
    
    // Opt-in retry for network errors or 5xx server errors
    if (error.response && error.response.status < 500) {
      throw error;
    }
    
    await new Promise(res => setTimeout(res, delay));
    return withRetry(apiCall, retries - 1, delay * 2);
  }
};
