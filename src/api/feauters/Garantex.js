export const GarantexBuyDollar = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtrub');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.asks && data.asks.length > 0) {
      return parseFloat(data.asks[0].price);
    } else {
      throw new Error('No ask prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex buy dollar rate:', error);
    throw error;
  }
}

export const GarantexSellDollar = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtrub');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For selling dollars (USDT), we use the highest bid price
    // This is the price at which the exchange buys USDT from the user
    if (data.bids && data.bids.length > 0) {
      // The bids array is sorted by price (descending), so the first element has the highest bid price
      return parseFloat(data.bids[0].price);
    } else {
      throw new Error('No bid prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex sell dollar rate:', error);
    throw error;
  }
}

export const GarantexUsdUsdtBuyDifference = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtusd');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For buying USDT, we use the lowest ask price
    if (data.asks && data.asks.length > 0) {
      const askPrice = parseFloat(data.asks[0].price);
      
      // Calculate the percentage difference from 1 USD
      // For USD/USDT, we need to calculate (price - 1) / 1 * 100
      const difference = ((askPrice - 1) / 1) * 100;
      
      // Round to 1 decimal place
      const percentDifference = difference.toFixed(1);
      
      // Add + sign if positive, - will be added automatically if negative
      if (difference > 0) {
        return `+${percentDifference}`;
      } else if (difference === 0) {
        return '0';
      } else {
        return percentDifference;
      }
    } else {
      throw new Error('No ask prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error calculating Garantex USD/USDT buy difference:', error);
    throw error;
  }
}

export const GarantexUsdUsdtSellDifference = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtusd');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For selling USDT, we use the highest bid price
    if (data.bids && data.bids.length > 0) {
      const bidPrice = parseFloat(data.bids[0].price);
      
      // Calculate the percentage difference from 1 USD
      // For USD/USDT, we need to calculate (price - 1) / 1 * 100
      const difference = ((bidPrice - 1) / 1) * 100;
      
      // Round to 1 decimal place
      const percentDifference = difference.toFixed(1);
      
      // Add + sign if positive, - will be added automatically if negative
      if (difference > 0) {
        return `+${percentDifference}`;
      } else if (difference === 0) {
        return '0';
      } else {
        return percentDifference;
      }
    } else {
      throw new Error('No bid prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error calculating Garantex USD/USDT sell difference:', error);
    throw error;
  }
}

// New function to get USDT/USD buy price
export const GarantexUsdtUsdBuyPrice = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtusd');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For buying USD with USDT, we use the lowest ask price
    if (data.asks && data.asks.length > 0) {
      return parseFloat(data.asks[0].price).toFixed(3);
    } else {
      throw new Error('No ask prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex USDT/USD buy price:', error);
    throw error;
  }
}

// New function to get USDT/USD sell price
export const GarantexUsdtUsdSellPrice = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=usdtusd');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For selling USD for USDT, we use the highest bid price
    if (data.bids && data.bids.length > 0) {
      return parseFloat(data.bids[0].price).toFixed(3);
    } else {
      throw new Error('No bid prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex USDT/USD sell price:', error);
    throw error;
  }
}

// New function to get BTC/RUB price
export const GarantexBtcRubPrice = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=btcrub');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // We'll use the last trade price or the midpoint between bid and ask
    if (data.asks && data.asks.length > 0 && data.bids && data.bids.length > 0) {
      const askPrice = parseFloat(data.asks[0].price);
      const bidPrice = parseFloat(data.bids[0].price);
      const midPrice = (askPrice + bidPrice) / 2;
      return midPrice;
    } else {
      throw new Error('No prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex BTC/RUB price:', error);
    throw error;
  }
}

// New function to get ETH/RUB price
export const GarantexEthRubPrice = async () => {
  try {
    const response = await fetch('https://garantex.org/api/v2/depth?market=ethrub');
    
    if (!response.ok) {
      throw new Error(`Garantex API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // We'll use the last trade price or the midpoint between bid and ask
    if (data.asks && data.asks.length > 0 && data.bids && data.bids.length > 0) {
      const askPrice = parseFloat(data.asks[0].price);
      const bidPrice = parseFloat(data.bids[0].price);
      const midPrice = (askPrice + bidPrice) / 2;
      return midPrice;
    } else {
      throw new Error('No prices available in Garantex API response');
    }
  } catch (error) {
    console.error('Error fetching Garantex ETH/RUB price:', error);
    throw error;
  }
}


