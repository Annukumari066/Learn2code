import AsyncStorage from '@react-native-async-storage/async-storage';

export let API_URL = 'https://learn2code.onrender.com';

// Asynchronously load the custom URL from AsyncStorage if it exists
AsyncStorage.getItem('custom_api_url')
  .then((url) => {
    if (url) {
      API_URL = url;
      console.log('[CONFIG] API_URL initialized from storage:', API_URL);
    }
  })
  .catch((err) => {
    console.error('[CONFIG] Error loading custom API URL from storage:', err);
  });

/**
 * Updates the API_URL dynamically and persists it.
 */
export const setApiUrl = async (newUrl: string) => {
  // Normalize URL (ensure it doesn't end with a slash for safety)
  let normalizedUrl = newUrl.trim();
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  API_URL = normalizedUrl;
  await AsyncStorage.setItem('custom_api_url', normalizedUrl);
  console.log('[CONFIG] API_URL updated to:', normalizedUrl);
};
