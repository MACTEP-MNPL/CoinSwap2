import { getGrinexDollarLastRate } from '../../db/rates.js';

export const getGrinexSellDollar = async () => {
    try {
        const latestRate = await getGrinexDollarLastRate();
        return latestRate.bid_weighted_price;
    } catch (error) {
        console.error('Error getting sell dollar price:', error);
        throw error;
    }
}


export const getGrinexBuyDollar = async () => {
    try {
        const latestRate = await getGrinexDollarLastRate();
        return latestRate.ask_weighted_price;
    } catch (error) {
        console.error('Error getting buy dollar price:', error);
        throw error;
    }
}

