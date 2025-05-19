import { Composer } from 'grammy'
import { updateBalance } from '../db/balances.js'
import { getAccountByChat, getAccountBalances } from '../db/accounts.js'
import { nFormat } from '../utils/n.js'
import { undoTopUpMenu } from '../menus/undoMenus.js'
import { createNewTransaction } from '../db/transactions.js'
import { getBalanceByAccountIdAndCurrency } from '../db/balances.js'
import * as math from 'mathjs'
import { api } from '../bot.js'

export const topUpBalanceByNameCommand = new Composer()

// Match Latin characters: /usd 100 or /usd 100 comment here
topUpBalanceByNameCommand.hears(/^\/([a-zA-Z]+)\s+.+/, async (ctx) => {
    try {
        const currency = ctx.match[1].toUpperCase();
        const fullText = ctx.message.text.slice(currency.length + 1).trim(); // +1 for the slash

        // Split by space to get expression and comment
        let [expression, ...commentParts] = fullText.split(' ');

        if (!expression) {
            await ctx.reply(
                'Укажите сумму и комментарий (комментарий необязателен).\n' +
                `Пример: <code>/${currency.toLowerCase()} 500</code> или <code>/${currency.toLowerCase()} -500</code> или <code>/${currency.toLowerCase()} 500 зарплата</code>`, 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Join comment parts back together in case there are spaces in the comment
        const comment = commentParts.join(' ').trim() || 'ПОПОЛНЕНИЕ СЧЕТА';

        console.log(expression, comment);

        // Replace keywords with their values
        expression = expression
        .replace(/тез/g, api.AVGDollarBuy)
        .replace(/цб/g, api.CBRFDollar)
        .replace(/профинанс/g, api.ProFinanceDollar)
        .replace(/инвест/g, api.InvestingDollar)
        .replace(/рапира/g, api.RapiraBuyDollar)
        .replace(/моска/g, api.MoscaBuyDollar)
        .replace(/гринекс/g, api.GrinexBuyDollar)
        .replace(/абц/g, api.ABCEXBuyDollar)
        .replace(/,/g, '.');

        // Evaluate the expression
        let amount = math.evaluate(expression);

        if (isNaN(amount)) {
            await ctx.reply('❌ Неверный формат выражения');
            return;
        }

        const account = await getAccountByChat(ctx.chat.id);

        if (!account) {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        const balances = await getAccountBalances(account.id);
        const hasBalance = balances.some(b => b.currency.toLowerCase() === currency.toLowerCase());
        
        if (!hasBalance) {
            await ctx.reply(
                `❌ Счет ${currency} не найден.\n` +
                'Создайте его командой: <code>/добавить ' + currency + '</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        if (isNaN(amount)) {
            await ctx.reply('❌ Неверный формат числа');
            return;
        }

        // Get the balance before update
        const [balance] = await getBalanceByAccountIdAndCurrency(account.id, currency);
        
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
        console.error('Error in dynamic currency command:', error);
        await ctx.reply('❌ Произошла ошибка при обновлении баланса');
        throw error;
    }
});

// Match Cyrillic characters: /рубль 100 or /рубль 100 комментарий
topUpBalanceByNameCommand.hears(/^\/([а-яА-Я]+)\s+(-?\d+\.?\d*)\s*(.*)$/, async (ctx) => {
    try {
        const currency = ctx.match[1].toUpperCase();
        const fullText = ctx.message.text.slice(currency.length + 1).trim(); // +1 for the slash

        // Split by space to get expression and comment
        let [expression, ...commentParts] = fullText.split(' ');

        if (!expression) {
            await ctx.reply(
                'Укажите сумму и комментарий (комментарий необязателен).\n' +
                `Пример: <code>/${currency.toLowerCase()} 500</code> или <code>/${currency.toLowerCase()} -500</code> или <code>/${currency.toLowerCase()} 500 зарплата</code>`, 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Join comment parts back together in case there are spaces in the comment
        const comment = commentParts.join(' ').trim() || 'ПОПОЛНЕНИЕ СЧЕТА';

        console.log(expression, comment);

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

        if (!account) {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        const balances = await getAccountBalances(account.id);
        const hasBalance = balances.some(b => b.currency.toLowerCase() === currency.toLowerCase());
        
        if (!hasBalance) {
            await ctx.reply(
                `❌ Счет ${currency} не найден.\n` +
                'Создайте его командой: <code>/добавить ' + currency + '</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        if (isNaN(amount)) {
            await ctx.reply('❌ Неверный формат числа');
            return;
        }

        // Get the balance before update
        const [balance] = await getBalanceByAccountIdAndCurrency(account.id, currency);
        
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
        console.error('Error in dynamic currency command:', error);
        await ctx.reply('❌ Произошла ошибка при обновлении баланса');
        throw error;
    }
});
