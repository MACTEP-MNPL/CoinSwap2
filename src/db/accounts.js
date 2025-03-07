import { db } from "../bot.js";


export const createNewAccount = async (chatId, name) => {
    try {
        const [result] = await db.execute(
            'INSERT INTO accounts (chat_id, name) VALUES (?, ?)',
            [chatId, name]
        );
        
        const accountId = result.insertId;

        const defaultCurrencies = ['USDT', 'RUB', 'USD', 'EUR'];
        
        for (const currency of defaultCurrencies) {
            await db.execute(
                'INSERT INTO balances (account_id, currency) VALUES (?, ?)',
                [accountId, currency]
            );
        }

        return accountId;

    } catch (error) {
        throw error;
    }
};

export const getAccountByChat = async (chatId) => {
    const [result] = await db.execute(
        'SELECT * FROM accounts WHERE chat_id = ?',
        [chatId]
    );
    return result[0];
};

export const getAccountBalances = async (accountId) => {
    const [result] = await db.execute(
        `SELECT currency, balance 
         FROM balances 
         WHERE account_id = ?
         ORDER BY 
            CASE 
                WHEN currency = 'USDT' THEN 1
                WHEN currency = 'RUB' THEN 2
                WHEN currency = 'USD' THEN 3
                WHEN currency = 'EURO' THEN 4
                ELSE 5
            END,
            currency ASC`,
        [accountId]
    );
    return result;
};

export const deleteAccountByChat = async (chatId) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM accounts WHERE chat_id = ?',
            [chatId]
        );
        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteAccountById = async (id) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM accounts WHERE id = ?',
            [id]
        );  

        return result;
    } catch (error) {
        throw error;
    }
};

export const getAccountById = async (id) => {
    const [result] = await db.execute(
        'SELECT * FROM accounts WHERE id = ?',
        [id]
    );
    return result[0];
};
