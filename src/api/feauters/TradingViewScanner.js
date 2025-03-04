import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_HOST = process.env.PROXY_HOST;
const PROXY_PORT = process.env.PROXY_PORT;
const PROXY_USERNAME = process.env.PROXY_USERNAME;
const PROXY_PASSWORD = process.env.PROXY_PASSWORD;

export const getRussianStocksScanner = async () => {
    try {
        const proxyAgent = new HttpsProxyAgent(`http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`);

        const response = await axios.get('https://scanner.tradingview.com/russia/scan', {
            httpsAgent: proxyAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from TradingView scanner');
        }

        // Process and format the data
        const stocks = response.data.data.map(stock => ({
            symbol: stock.s,
            name: stock.d[0], // Company name
            price: stock.d[1], // Current price
            change: stock.d[2], // Price change
            changePercent: stock.d[3], // Price change percentage
            volume: stock.d[4], // Trading volume
            marketCap: stock.d[5] // Market capitalization
        }));

        return stocks;
    } catch (error) {
        console.error('Error fetching Russian stocks scanner data:', error);
        throw error;
    }
}; 