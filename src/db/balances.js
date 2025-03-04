import { db } from "../bot.js";

export const getBalanceByAccountId = async (accountId) => {
    const [result] = await db.execute(
        'SELECT * FROM balances WHERE account_id = ?',
        [accountId]
    );
    return result;
};

export const updateBalance = async (chatId, currency, amount) => {
    try {
        const [accounts] = await db.execute(
            'SELECT accounts.id, balances.balance FROM accounts ' +
            'JOIN balances ON accounts.id = balances.account_id ' +
            'WHERE accounts.chat_id = ? AND balances.currency = ?',
            [chatId, currency]
        );

        if (!accounts.length) {
            throw new Error('ACCOUNT_NOT_FOUND');
        }

        const newBalance = Number(accounts[0].balance) + Number(amount);

        await db.execute(
            'UPDATE balances SET balance = ? ' +
            'WHERE account_id = ? AND currency = ?',
            [newBalance, accounts[0].id, currency]
        );

        return newBalance;
    } catch (error) {
        throw error;
    }
};

export const createNewBalance = async (accountId, currency) => {
        try {
            await db.execute(
                'INSERT INTO balances (account_id, currency, balance) VALUES (?, ?, 0.00)',
                [accountId, currency.toUpperCase()]
            );
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('CURRENCY_EXISTS');
            }
            throw error;
        }
    };

    export const deleteBalanceByName = async (accountId, currency) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM balances WHERE account_id = ? AND currency = ?',
                [accountId, currency.toUpperCase()]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('BALANCE_NOT_FOUND');
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    };

    export const deleteBalanceById = async (balanceId) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM balances WHERE id = ?',
                [balanceId]
            );

            if (result.affectedRows === 0) {
                throw new Error('BALANCE_NOT_FOUND');
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    };


export const resetBalance = async (accountId, currency) => {
    try {
        
        const [result] = await db.execute(
            'UPDATE balances SET balance = 0.00 WHERE account_id = ? AND currency = ?',
            [accountId, currency.toUpperCase()]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('BALANCE_NOT_FOUND');
        }
    
    } catch (error) {
        throw error;
    }
};


export const getBalanceByAccountIdAndCurrency = async (accountId, currency) => {
    const [result] = await db.execute(
        'SELECT * FROM balances WHERE account_id = ? AND currency = ?',
        [accountId, currency.toUpperCase()]
    );
    return result;
};

export const createNewBalanceWithBalance = async (accountId, currency, balance) => {
    try {
        await db.execute(
            'INSERT INTO balances (account_id, currency, balance) VALUES (?, ?, ?)',
            [accountId, currency.toUpperCase(), balance]
        );
            return true;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('CURRENCY_EXISTS');
        }
        throw error;
    }
};

export const getBalanceById = async (balanceId) => {
    const [result] = await db.execute(
        'SELECT * FROM balances WHERE id = ?',
        [balanceId]
    );
    return result;
};

