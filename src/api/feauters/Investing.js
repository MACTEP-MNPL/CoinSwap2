import axios from 'axios';

// ExchangeRate-API offers 1,500 API calls per month on their free plan
// Sign up at https://www.exchangerate-api.com/
const API_KEY = '30dbf5e53cb5845316103852'; // Replace with your actual API key
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Cache mechanism to avoid unnecessary API calls
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Helper function to fetch rates with caching
const fetchRates = async () => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedRates;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/USD`);
    
    if (response.status !== 200) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Update cache
    cachedRates = response.data;
    lastFetchTime = now;
    
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const getInvestingDollar = async () => {
  try {
    const data = await fetchRates();
    
    if (data.result !== 'success') {
      throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
    }
    
    const rate = data.conversion_rates.RUB;
    return rate;
  } catch (error) {
    console.error('Error fetching USD/RUB rate:', error);
    throw error;
  }
};

export const getInvestingEuro = async () => {
  try {
    const data = await fetchRates();
    
    if (data.result !== 'success') {
      throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
    }
    
    // Calculate EUR/RUB from USD/RUB and USD/EUR
    const usdToRub = data.conversion_rates.RUB;
    const usdToEur = data.conversion_rates.EUR;
    const eurToRub = usdToRub / usdToEur;
    
    return eurToRub;
  } catch (error) {
    console.error('Error fetching EUR/RUB rate:', error);
    throw error;
  }
};
