import { db } from "../bot.js"

export const createNewTransaction = async (balanceId, userId, accountId, amount, comment, currentBalance, messageId, currency) => {
    console.log("CREATE NEW TRANSACTION ", balanceId, userId, accountId, amount, comment, currentBalance, messageId, currency);
    const [result] = await db.execute(
        'INSERT INTO transactions (balance_id,user_id, account_id, amount, comment, current_balance, message_id, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [balanceId, userId, accountId, amount, comment, currentBalance, messageId, currency]
    )
}

export const getTransactionByAccountIdAndMessageId = async (accountId, messageId) => {
    const [result] = await db.execute(
        'SELECT * FROM transactions WHERE account_id = ? AND message_id = ?',
        [accountId, messageId]
    )
    return [result];
}
