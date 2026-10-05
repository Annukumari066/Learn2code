export let API_URL = 'https://learn2code.onrender.com';

export const loadApiUrl = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;

    const url = await AsyncStorage.getItem('custom_api_url');

    if (url) {
      API_URL = url;
      console.log('[CONFIG] API_URL initialized from storage:', API_URL);
    }
  } catch (err) {
    console.error('[CONFIG] Error loading custom API URL from storage:', err);
  }
};

export const setApiUrl = async (newUrl: string) => {
  let normalizedUrl = newUrl.trim();

  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  API_URL = normalizedUrl;

  if (typeof window !== 'undefined') {
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;

      await AsyncStorage.setItem('custom_api_url', normalizedUrl);
      console.log('[CONFIG] API_URL updated to:', normalizedUrl);
    } catch (err) {
      console.error('[CONFIG] Error saving API URL:', err);
    }
  }
};