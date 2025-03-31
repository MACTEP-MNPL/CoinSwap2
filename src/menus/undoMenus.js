import { Composer } from "grammy";
import { Menu } from "@grammyjs/menu";
import { isAdmin } from "../utils/userLvl.js";
import { updateBalance } from "../db/balances.js";
import { nFormat } from "../utils/n.js";
import { createNewBalanceWithBalance } from "../db/balances.js";
import { getAccountByChat } from "../db/accounts.js";
import { getTransactionByAccountIdAndMessageId } from "../db/transactions.js";
import { deleteBalanceById } from "../db/balances.js";
import { getBalanceById } from "../db/balances.js";
import { InlineKeyboard } from "grammy";
import { createNewTransaction } from "../db/transactions.js";

export const undoMenus = new Composer()

export const undoTopUpMenu = new Menu('undoTopUpMenu')
.text(
    {text: "❗️ Отменить пополнение"},
    async (ctx) => {
        if (!await isAdmin(ctx)) {
            return;
        }

        const messageId = (ctx.update.callback_query.message.message_id - 1);

        try {
            const account = await getAccountByChat(ctx.chat.id);
            
            if (!account) {
                await ctx.reply("❌ Аккаунт не найден");
                return;
            }
            
            // Get the transaction record
            const [[transaction]] = await getTransactionByAccountIdAndMessageId(account.id, messageId);
            
            if (!transaction) {
                await ctx.reply("❌ Транзакция не найдена");
                return;
            }
            
            // Get the current balance
            const balances = await getBalanceById(transaction.balance_id);
            
            if (!balances || balances.length === 0) {
                await ctx.reply("❌ Баланс не найден");
                return;
            }
            
            // Reverse the transaction amount
            const reverseAmount = -parseFloat(transaction.amount);
            
            // Update the balance
            const updatedBalance = await updateBalance(ctx.chat.id, transaction.currency, reverseAmount);
            
            // Create a new transaction record for the reversal
            await createNewTransaction(
                transaction.balance_id,
                ctx.from.id,
                account.id,
                reverseAmount,
                `ОТМЕНА ПОПОЛНЕНИЯ СЧЕТА`,
                updatedBalance,
                messageId,
                transaction.currency
            );
            
            await ctx.editMessageText(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `${transaction.currency}: ${nFormat(updatedBalance)}\n\n` +
                `❗️ <b>Действие было отменено</b>`,
                {
                    parse_mode: 'HTML',
                    reply_markup: new InlineKeyboard()
                }
            );

            // Send new informative message about the undo operation
            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `❌ Отмена пополнения:\n\n` +
                `${reverseAmount} ${transaction.currency}\n\n` +
                `${transaction.currency}: ${nFormat(updatedBalance)}`,
                { parse_mode: 'HTML' }
            );

        } catch (error) {
            await ctx.deleteMessage();
            await ctx.reply("❌ Ошибка при отмене операции");
            console.error(error);
        }
    }
)
.row()

export const undoCreatingNewBalanceMenu = new Menu('undoCreatingNewBalanceMenu')
.text(
    {text: "❗️ Отменить действие"},
    async (ctx) => {
        if (!await isAdmin(ctx)) {
            return;
        }

        const messageId = (ctx.update.callback_query.message.message_id - 1);

        try {

            const account = await getAccountByChat(ctx.chat.id);

            const [[transaction]] = await getTransactionByAccountIdAndMessageId(account.id, messageId)
            const [balance] = await getBalanceById(transaction.balance_id);
            
            await deleteBalanceById(balance.id);

            await createNewTransaction(balance.id, ctx.from.id, account.id, 0,`ОТМЕНА СОЗДАНИЯ СЧЕТА`, 0, messageId, balance.currency)

            await ctx.editMessageText(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `<i>"Счет ${transaction.currency} добавлен"</i>\n\n` +
                `❗️ <b>Действие было отменено</b>`,
                {
                    parse_mode: 'HTML', 
                    reply_markup: new InlineKeyboard()
                }
            );
            
            // Send new informative message about the undo operation
            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `❌ Отмена создания счета:\n\n` +
                `${transaction.currency}: 0`,
                { parse_mode: 'HTML' }
            );

        } catch (error) {
            await ctx.deleteMessage();
            await ctx.reply("❌ Ошибка при отмене операции");
            console.error(error);
        }
    }
)

export const undoClearingBalanceMenu = new Menu('undoClearingBalanceMenu')
.text(
    {text: "❗️ Отменить действие"},
    async (ctx) => {
        if (!await isAdmin(ctx)) {
            return;
        }

        const messageId = (ctx.update.callback_query.message.message_id - 1);

        try {
            const account = await getAccountByChat(ctx.chat.id);

            const [[transaction]] = await getTransactionByAccountIdAndMessageId(account.id, messageId);

            // Need to restore the original amount
            const restoredAmount = -transaction.amount;
            
            await updateBalance(ctx.chat.id, transaction.currency, restoredAmount);
            
            await ctx.editMessageText(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `<i>"Баланс ${transaction.currency} обнулен"</i>\n\n` +
                `❗️ <b>Действие было отменено</b>`,
                {parse_mode: 'HTML', reply_markup: new InlineKeyboard()}
            );

            await createNewTransaction(transaction.balance_id, ctx.from.id, account.id, restoredAmount,`ОТМЕНА ОБНУЛЕНИЯ СЧЕТА`, restoredAmount, messageId, transaction.currency);
            
            // Send new informative message about the undo operation
            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `❌ Отмена обнуления счета:\n\n` +
                `${restoredAmount} ${transaction.currency}\n\n` +
                `${transaction.currency}: ${nFormat(restoredAmount)}`,
                { parse_mode: 'HTML' }
            );

        } catch (error) {
            await ctx.deleteMessage();
            await ctx.reply("❌ Ошибка при отмене операции");
            console.error(error);
        }
    }
)

export const undoDeletingNewBalanceMenu = new Menu('undoDeletingNewBalanceMenu')
.text(
    {text: "❗️ Отменить действие"},
    async (ctx) => {
        if (!await isAdmin(ctx)) {
            return;
        }

        const messageId = (ctx.update.callback_query.message.message_id - 1);

        try {
            const account = await getAccountByChat(ctx.chat.id);

            const [[transaction]] = await getTransactionByAccountIdAndMessageId(account.id, messageId);

            // Create the balance with the original amount
            const restoredAmount = -transaction.amount;
            const newBalance = await createNewBalanceWithBalance(account.id, transaction.currency, restoredAmount);
            
            await ctx.editMessageText(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `<i>"Счет ${transaction.currency} удалён"</i>\n\n` +
                `❗️ <b>Действие было отменено</b>`,
                {parse_mode: 'HTML', reply_markup: new InlineKeyboard()}
            ); 
            
            await createNewTransaction(transaction.balance_id, ctx.from.id, account.id, restoredAmount,`ВОССТАНОВЛЕНИЕ СЧЕТА`, restoredAmount, messageId, transaction.currency);
            
            // Send new informative message about the undo operation
            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `❌ Отмена удаления счета:\n\n` +
                `${transaction.currency}: ${nFormat(restoredAmount)}`,
                { parse_mode: 'HTML' }
            );

        } catch (error) {
            await ctx.deleteMessage();
            await ctx.reply("❌ Ошибка при отмене операции");
            console.error(error);
        }
    }
)

undoMenus.use(undoTopUpMenu)
undoMenus.use(undoCreatingNewBalanceMenu)
undoMenus.use(undoClearingBalanceMenu)
undoMenus.use(undoDeletingNewBalanceMenu)

//Сделать отмену создания счета, его очистки и удаления





