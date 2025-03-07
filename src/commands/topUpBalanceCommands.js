import { Composer } from 'grammy'
import { updateBalance} from '../db/balances.js'
import { getAccountByChat } from '../db/accounts.js'
import { nFormat } from '../utils/n.js'
import { undoTopUpMenu } from '../menus/undoMenus.js'
import { createNewTransaction } from '../db/transactions.js'
import { getBalanceByAccountIdAndCurrency } from '../db/balances.js'
import * as math from 'mathjs';
import { api } from '../bot.js'

export const topUpBalanceCommands = new Composer()

const handleBalanceUpdate = async (ctx, currency, commandName) => {
    try {
        const fullText = ctx.message.text.slice(commandName.length).trim();
        
        // Split by space to get expression and comment
        let [expression, ...commentParts] = fullText.split(' ');
        
        if (!expression) {
            await ctx.reply(
                'Укажите сумму и комментарий (комментарий необязателен).\n' +
                `Пример: <code>${commandName} 500</code> или <code>${commandName} -500</code> или <code>${commandName} 500 зарплата</code>`, 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Join comment parts back together in case there are spaces in the comment
        const comment = commentParts.join(' ').trim() || 'ПОПОЛНЕНИЕ СЧЕТА';

        // Replace keywords with their values
        expression = expression
            .replace(/абц/g, api.ABCEXBuyDollar)
            .replace(/,/g, '.');

        // Evaluate the expression
        let amount = math.evaluate(expression);

        if (isNaN(amount)) {
            await ctx.reply('❌ Неверный формат выражения');
            return;
        }

        const account = await getAccountByChat(ctx.chat.id);

        console.log('account', account);

        if (!account) {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Get the balance before update
        const [balance] = await getBalanceByAccountIdAndCurrency(account.id, currency);

        console.log('balance', balance);
        
        // Update the balance
        const newBalance = await updateBalance(ctx.chat.id, currency, amount);

        // Create a transaction record
        await createNewTransaction(
            balance.id,
            ctx.from.id,
            account.id,
            amount,
            comment,
            newBalance,
            ctx.message.message_id,
            currency
        );

        await ctx.reply(
            `<blockquote>#${account.name}</blockquote>\n\n` +
            `${amount > 0 ? '+' : ''}${nFormat(amount)} ${currency}\n\n` +
            `${currency}: ${nFormat(newBalance)}`,
            {
                parse_mode: 'HTML',
                reply_markup: undoTopUpMenu
            }
        );

    } catch (error) {
        if (error.message === 'ACCOUNT_NOT_FOUND') {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }
        console.error('Error in balance update command:', error);
        await ctx.reply('❌ Произошла ошибка при обновлении баланса');
        throw error;
    }
};

// Update regex patterns to match any text after the command and space
topUpBalanceCommands.hears(/^\/тез\s+.+/, ctx => handleBalanceUpdate(ctx, 'USDT', '/тез'));
topUpBalanceCommands.hears(/^\/руб\s+.+/, ctx => handleBalanceUpdate(ctx, 'RUB', '/руб'));
topUpBalanceCommands.hears(/^\/евр\s+.+/, ctx => handleBalanceUpdate(ctx, 'EUR', '/евр'));
topUpBalanceCommands.hears(/^\/бакс\s+.+/, ctx => handleBalanceUpdate(ctx, 'USD', '/бакс'));


