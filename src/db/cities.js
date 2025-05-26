import { db } from "../bot.js"
import { ABCEXBuyDollar } from "../api/feauters/ABCEX.js"
import { ABCEXSellDollar } from "../api/feauters/ABCEX.js"
import { nFormat } from "../utils/n.js"
import { api } from "../bot.js"

export const getMoscow = async () => {
    const [result] = await db.execute(
        'SELECT * FROM cities WHERE name = "Москва"'
    )

    const avgBuyRate = api.AVGDollarBuy
    const avgSellRate = api.AVGDollarSell

    
    const city = {
        ...result[0],
        buy_price: nFormat(Number(avgBuyRate) + Number(result[0].buy_margin)),
        sell_price: nFormat(Number(avgSellRate) - Number(result[0].sell_margin))
    }

    return city
}

export const getMakhachkala = async () => {
    const [result] = await db.execute(
        'SELECT * FROM cities WHERE name = "Махачкала"'
    )

    const avgBuyRate = api.AVGDollarBuy
    const avgSellRate = api.AVGDollarSell

    const city = {
        ...result[0],
        buy_price: nFormat(Number(avgBuyRate) + Number(result[0].buy_margin)),
        sell_price: nFormat(Number(avgSellRate) - Number(result[0].sell_margin))
    }

    return city
}

// Get all cities from the database
export const getAllCities = async () => {
    const [result] = await db.execute(
        'SELECT * FROM cities WHERE is_active = 1'
    )
    
    return result
}

// Get a city by its name
export const getCityByName = async (name) => {
    const [result] = await db.execute(
        'SELECT * FROM cities WHERE name = ?', [name]
    )
    
    if (result.length === 0) {
        return null
    }
    
    const city = {
        ...result[0],
        buy_price: nFormat(Number(await ABCEXBuyDollar()) + Number(result[0].buy_margin)),
        sell_price: nFormat(Number(await ABCEXSellDollar()) - Number(result[0].sell_margin))
    }
    
    return city
}

// Update city margin (buy or sell)
export const updateCityMargin = async (cityName, marginType, newValue) => {
    if (marginType !== 'buy_margin' && marginType !== 'sell_margin') {
        throw new Error('Invalid margin type. Must be "buy_margin" or "sell_margin"')
    }
    
    await db.execute(
        `UPDATE cities SET ${marginType} = ?, updated_at = NOW() WHERE name = ?`, 
        [newValue, cityName]
    )
    
    return await getCityByName(cityName)
}

// Get city by ID
export const getCityById = async (cityId) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM cities WHERE id = ?',
            [cityId]
        );
        return rows[0];
    } catch (error) {
        console.error("Error getting city by ID:", error);
        throw error;
    }
};

// Update city buy margin
export const updateCityBuyMargin = async (cityId, changeAmount) => {
    try {
        // First get current margin
        const [currentData] = await db.execute(
            'SELECT buy_margin FROM cities WHERE id = ?',
            [cityId]
        );
        
        if (!currentData || currentData.length === 0) {
            throw new Error("City not found");
        }

        const currentMargin = currentData[0].buy_margin;
        const newMargin = Math.max(0, Number(currentMargin) + Number(changeAmount)); // Prevent negative margins
        
        await db.execute(
            'UPDATE cities SET buy_margin = ? WHERE id = ?',
            [newMargin, cityId]
        );
        
        return newMargin;
    } catch (error) {
        console.error("Error updating buy margin:", error);
        throw error;
    }
};

// Update city sell margin
export const updateCitySellMargin = async (cityId, changeAmount) => {
    try {
        // First get current margin
        const [currentData] = await db.execute(
            'SELECT sell_margin FROM cities WHERE id = ?',
            [cityId]
        );
        
        if (!currentData || currentData.length === 0) {
            throw new Error("City not found");
        }

        const currentMargin = currentData[0].sell_margin;
        const newMargin = Math.max(0, Number(currentMargin) + Number(changeAmount)); // Prevent negative margins
        
        await db.execute(
            'UPDATE cities SET sell_margin = ? WHERE id = ?',
            [newMargin, cityId]
        );
        
        return newMargin;
    } catch (error) {
        console.error("Error updating sell margin:", error);
        throw error;
    }
};

export const updateDynamicMakhachkala = async (buyPrice, sellPrice) => {
    try {
        // Get current data first
        const [currentData] = await db.execute('SELECT * FROM city WHERE name = ?', ['makhachkala']);
        
        // Check if the city exists
        if (currentData.length === 0) {
            // If not, create it
            await db.execute(
                'INSERT INTO city (name, buy_price, sell_price) VALUES (?, ?, ?)',
                ['makhachkala', buyPrice, sellPrice]
            );
        } else {
            // If it exists, update it
            await db.execute(
                'UPDATE city SET buy_price = ?, sell_price = ? WHERE name = ?',
                [buyPrice, sellPrice, 'makhachkala']
            );
        }
        
        return true;
    } catch (error) {
        console.error('Error updating Makhachkala prices:', error);
        throw error;
    }
};

export const updateDynamicMoscow = async (buyPrice, sellPrice) => {
    try {
        // Get current data first
        const [currentData] = await db.execute('SELECT * FROM city WHERE name = ?', ['moscow']);
        
        // Check if the city exists
        if (currentData.length === 0) {
            // If not, create it
            await db.execute(
                'INSERT INTO city (name, buy_price, sell_price) VALUES (?, ?, ?)',
                ['moscow', buyPrice, sellPrice]
            );
        } else {
            // If it exists, update it
            await db.execute(
                'UPDATE city SET buy_price = ?, sell_price = ? WHERE name = ?',
                [buyPrice, sellPrice, 'moscow']
            );
        }
        
        return true;
    } catch (error) {
        console.error('Error updating Moscow prices:', error);
        throw error;
    }
};