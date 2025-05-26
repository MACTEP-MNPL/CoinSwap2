import { Composer } from 'grammy'
import { updateBalance } from '../db/balances.js'
import { getAccountByChat, getAccountBalances } from '../db/accounts.js'
import { nFormat } from '../utils/n.js'
import { undoTopUpMenu } from '../menus/undoMenus.js'
import { createNewTransaction } from '../db/transactions.js'
import { getBalanceByAccountIdAndCurrency } from '../db/balances.js'
import * as math from 'mathjs'
import { api } from '../bot.js'

export const topUpBalanceHears = new Composer()

topUpBalanceHears.hears(/^(тез|руб|евр|бакс|usdt|rub|eur|usd)(\s+.+)$/i, async (ctx, next) => {
    try {
        const currencyAlias = ctx.match[1].toLowerCase();
        const fullText = ctx.match[2].trim();
        
        // Map the currency alias to the actual currency code
        const currencyMap = {
            'тез': 'USDT',
            'usdt': 'USDT',
            'руб': 'RUB',
            'rub': 'RUB', 
            'евр': 'EUR',
            'eur': 'EUR',
            'бакс': 'USD',
            'usd': 'USD'
        };
        
        const currency = currencyMap[currencyAlias];
        
        // If the currency isn't found in our map, skip to next handler
        if (!currency) {
            return next();
        }
        
        // Split by space to get expression and comment
        let [expression, ...commentParts] = fullText.split(' ');

        if (!expression) {
            await ctx.reply(
                'Укажите сумму и комментарий (комментарий необязателен).\n' +
                `Пример: <code>${currencyAlias} 500</code> или <code>${currencyAlias} -500</code> или <code>${currencyAlias} 500 зарплата</code>`, 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Join comment parts back together in case there are spaces in the comment
        const comment = commentParts.join(' ').trim() || 'ПОПОЛНЕНИЕ СЧЕТА';

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
                'Создайте его командой: <code>/создай Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        const balances = await getAccountBalances(account.id);
        const hasBalance = balances.some(b => b.currency === currency);
        
        if (!hasBalance) {
            await ctx.reply(
                `❌ Счет ${currency} не найден.\n` +
                'Создайте его командой: <code>/добавь ' + currency + '</code>', 
                {parse_mode: 'HTML'}
            );
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
        if (error.message === 'ACCOUNT_NOT_FOUND') {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создай Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }
        console.error('Error in topUpBalanceHears middleware:', error);
        await ctx.reply('❌ Произошла ошибка при обновлении баланса');
    }

    // If we reached here, it means we handled this message, so don't pass to next handlers
});

// Handle dynamic currency names at the beginning of the message
// This handles cases like "btc 100", "etc 200", etc.
topUpBalanceHears.hears(/^([a-zA-Zа-яА-Я]+)(\s+.+)$/, async (ctx, next) => {
    try {
        const currency = ctx.match[1].toUpperCase();
        const fullText = ctx.match[2].trim();
        
        // Common currencies that should always trigger this handler
        const knownCurrencies = ['TRY', 'GBP', 'CNY', 'JPY', 'BTC', 'ETH', 'BNB'];
        
        // Check if the account exists and has this currency
        const account = await getAccountByChat(ctx.chat.id);
        
        if (!account) {
            // Skip to next handler if no account found
            return next();
        }
        
        const balances = await getAccountBalances(account.id);
        const hasBalance = balances.some(b => b.currency === currency);
        
        // If the currency isn't found in balances and it's not a common currency, skip to next handler
        if (!hasBalance && !knownCurrencies.includes(currency)) {
            return next();
        }
        
        // Split by space to get expression and comment
        let [expression, ...commentParts] = fullText.split(' ');

        if (!expression) {
            await ctx.reply(
                'Укажите сумму и комментарий (комментарий необязателен).\n' +
                `Пример: <code>${currency.toLowerCase()} 500</code> или <code>${currency.toLowerCase()} -500</code> или <code>${currency.toLowerCase()} 500 комментарий</code>`, 
                {parse_mode: 'HTML'}
            );
            return;
        }

        // Join comment parts back together in case there are spaces in the comment
        const comment = commentParts.join(' ').trim() || 'ПОПОЛНЕНИЕ СЧЕТА';

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

        if (!hasBalance) {
            await ctx.reply(
                `❌ Счет ${currency} не найден.\n` +
                'Создайте его командой: <code>/добавь ' + currency + '</code>', 
                {parse_mode: 'HTML'}
            );
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
        // If there's an error, skip to the next handler
        return next();
    }
});
