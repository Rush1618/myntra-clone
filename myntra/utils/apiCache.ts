import axios from 'axios';

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const fetchWithCache = async (url: string, forceRefresh = false) => {
  const now = Date.now();
  
  if (!forceRefresh && cache[url] && (now - cache[url].timestamp < CACHE_DURATION)) {
    return cache[url].data;
  }

  try {
    const response = await axios.get(url);
    cache[url] = {
      data: response.data,
      timestamp: now,
    };
    return response.data;
  } catch (error) {
    // If request fails but we have stale cache, return it to keep app fast
    if (cache[url]) {
      return cache[url].data;
    }
    throw error;
  }
};
