import { db } from '../bot.js';

export const getGrinexDollarLastRate = async () => {
    try {
        const [rows] = await db.execute(`
            SELECT * FROM grinex_rates
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        return rows[0];
    } catch (error) {
        console.error('Error fetching latest exchange rates:', error);
        throw error;
    }
}

export const getXeRatesLastRate = async () => {
    try {
        const [rows] = await db.execute(`
            SELECT * FROM xe_rates
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        return rows[0];
    } catch (error) {
        console.error('Error fetching latest exchange rates:', error);
        throw error;
    }
}

export const getInvestingLastRate = async () => {
    try {
        const [rows] = await db.execute(`
            SELECT * FROM investing_rates
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        return rows[0];
    } catch (error) {
        console.error('Error fetching latest exchange rates:', error);
        throw error;
    }
}