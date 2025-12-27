import { useState, useCallback } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge/utilities';

/**
 * Custom hook for making authenticated API calls
 */
export function useApi() {
  const app = useAppBridge();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Get session token from App Bridge
      const token = await getSessionToken(app);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle authentication errors
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [app]);

  return {
    fetchWithAuth,
    loading,
    error,
    setError
  };
}

export default useApi;
