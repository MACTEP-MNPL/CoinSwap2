import { db } from "../bot.js"
import { getAccountByChat } from "./accounts.js"

export const createNewTransaction = async (balanceId, userId, accountId, amount, comment, currentBalance, messageId, currency) => {
    try {
        await db.execute(
            'INSERT INTO transactions (balance_id, user_id, account_id, amount, comment, current_balance, message_id, currency, is_shown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [balanceId, userId, accountId, amount, comment, currentBalance, messageId, currency, true]
        );
        return true;
    } catch (error) {
        throw error;
    }
};

export const getTransactionByAccountIdAndMessageId = async (accountId, messageId) => {
    const [result] = await db.execute(
        'SELECT * FROM transactions WHERE account_id = ? AND message_id = ?',
        [accountId, messageId]
    );
    return result;
};

export const hideTransactionsByCtx = async (ctx) => {
    const account = await getAccountByChat(ctx.chat.id)
    if (!account) {
        await ctx.reply('❌ Аккаунт не найден', {parse_mode: 'HTML'})
        return
    }

    await db.execute(
        'UPDATE transactions SET is_shown = FALSE WHERE account_id = ?',
        [account.id]
    )
    
}
