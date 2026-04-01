import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

/**
 * useApi — Fetches data from the API with loading, error, and refetch support
 *
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: bool, deps: array }
 */
const useApi = (url, options = {}) => {
  const { immediate = true, deps = [] } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async (params) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(url, {
        params,
        signal: abortRef.current.signal,
      });
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.message || 'Request failed');
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.response?.data?.message || err.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
  }, [url]); // eslint-disable-line

  useEffect(() => {
    if (immediate) fetch();
    return () => abortRef.current?.abort();
  }, [immediate, ...deps]); // eslint-disable-line

  return { data, loading, error, refetch: fetch };
};

/**
 * useMutation — For POST/PUT/PATCH/DELETE requests
 */
const useMutation = (method = 'post') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (url, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api[method](url, data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [method]);

  return { mutate, loading, error };
};

export { useApi, useMutation };
export default useApi;
