export const ABCEXBuyDollar = async () => {
  try {
    const response = await fetch('https://gateway.abcex.io/api/v1/markets/price?marketId=USDTRUB', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrenNJYUxtY0R2RVBlRGRYVHVQOXVYN050UzZDSXZ5WXR5VXhwemRrdEZJIn0.eyJleHAiOjE3Njk4NjU2NjYsImlhdCI6MTczODMyOTY2NiwianRpIjoiNzFkNjhmOWYtYzIzYi00OGQ5LWFkY2EtYzVmYzIzOTcxYjEyIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmFiY2V4LmlvL3JlYWxtcy9hYmNleCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJiNGY4ZTExZi02MjEyLTQ3NDMtOWQ3OS00MTU1OTZhYWQ3NzEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhcHAtYXBpLWtleWNsb2FrLWdhdGV3YXkiLCJzZXNzaW9uX3N0YXRlIjoiMDFiOGIzZmEtM2UyNC00ODVkLWFjMDItNDNhMmY5YjZhZTJkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtYWJjZXguaW8iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6IiIsInNpZCI6IjAxYjhiM2ZhLTNlMjQtNDg1ZC1hYzAyLTQzYTJmOWI2YWUyZCIsImlkIjoiNmZiNjc5Y2EtMjg5Zi00ODYzLWFkN2MtZWQ1M2MzZjUzZjgyIn0.gVNs0vvitGsBTLNVl4GYUQEoEA8Tpl67JutV794lSJ6A5JXW-ciILnIWYy9dffOrKtModQ6lJ1vsyHfgYiipOBnY8JMl1y3DjEfs093_Fl6nrkwNwUhv6DSpOB5oPsm7pDuaEkxz7eepWlKl4Xee0btEmQd6YFm9lAfVRKNhu7n6sIaLim_WEH6Vry6NrqH6DQFV_4fYPyG4EIKpgJj4vq4HCXuZZQglNHb6p9dQC2EgqfEGbtkC1na6ylyDHg6lj5yco_EaLPsczo8zPiKazaEPRh84VeCJ5sfkCqUwjek32KS6FLvrcTGcT37k-fD1LUBw86G0xlEKIMmvoUycOg`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ABCEX API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For buying dollars (USDT), we use the askPrice
    // This is the price at which the exchange sells USDT to the user
    return data.askPrice;
  } catch (error) {
    console.error('Error fetching ABCEX buy dollar rate:', error);
    throw error;
  }
}

export const ABCEXSellDollar = async () => {
  try {
    const response = await fetch('https://gateway.abcex.io/api/v1/markets/price?marketId=USDTRUB', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrenNJYUxtY0R2RVBlRGRYVHVQOXVYN050UzZDSXZ5WXR5VXhwemRrdEZJIn0.eyJleHAiOjE3Njk4NjU2NjYsImlhdCI6MTczODMyOTY2NiwianRpIjoiNzFkNjhmOWYtYzIzYi00OGQ5LWFkY2EtYzVmYzIzOTcxYjEyIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmFiY2V4LmlvL3JlYWxtcy9hYmNleCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJiNGY4ZTExZi02MjEyLTQ3NDMtOWQ3OS00MTU1OTZhYWQ3NzEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhcHAtYXBpLWtleWNsb2FrLWdhdGV3YXkiLCJzZXNzaW9uX3N0YXRlIjoiMDFiOGIzZmEtM2UyNC00ODVkLWFjMDItNDNhMmY5YjZhZTJkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtYWJjZXguaW8iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6IiIsInNpZCI6IjAxYjhiM2ZhLTNlMjQtNDg1ZC1hYzAyLTQzYTJmOWI2YWUyZCIsImlkIjoiNmZiNjc5Y2EtMjg5Zi00ODYzLWFkN2MtZWQ1M2MzZjUzZjgyIn0.gVNs0vvitGsBTLNVl4GYUQEoEA8Tpl67JutV794lSJ6A5JXW-ciILnIWYy9dffOrKtModQ6lJ1vsyHfgYiipOBnY8JMl1y3DjEfs093_Fl6nrkwNwUhv6DSpOB5oPsm7pDuaEkxz7eepWlKl4Xee0btEmQd6YFm9lAfVRKNhu7n6sIaLim_WEH6Vry6NrqH6DQFV_4fYPyG4EIKpgJj4vq4HCXuZZQglNHb6p9dQC2EgqfEGbtkC1na6ylyDHg6lj5yco_EaLPsczo8zPiKazaEPRh84VeCJ5sfkCqUwjek32KS6FLvrcTGcT37k-fD1LUBw86G0xlEKIMmvoUycOg`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ABCEX API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // For selling dollars (USDT), we use the bidPrice
    // This is the price at which the exchange buys USDT from the user
    return data.bidPrice;
  } catch (error) {
    console.error('Error fetching ABCEX sell dollar rate:', error);
    throw error;
  }
}
