import { getNewCode } from "../db/codes.js"
import { getNewToken } from "../db/tokens.js"
import { isUser2Lvl, isAdmin } from "../utils/userLvl.js"
import { getAccountByChat, getAccountBalances } from "../db/accounts.js"
import { nFormat, nCode } from "../utils/n.js"
import { getMoscow, getMakhachkala } from "../db/cities.js"
import { getABCEXCommandMessage } from "../messages/getABCEXCommandMessage.js"
import { getXERatesMessage } from "../messages/getXERatesMessage.js"
import { isPrivate } from "../utils/isPrivate.js"
import { createNewAccount, deleteAccountByChat } from "../db/accounts.js"
import { db } from "../bot.js"
import { createNewBalance, deleteBalanceByName, resetBalance, getBalanceByAccountIdAndCurrency } from "../db/balances.js"
import { undoCreatingNewBalanceMenu, undoClearingBalanceMenu, undoDeletingNewBalanceMenu } from "../menus/undoMenus.js"
import { createNewTransaction } from "../db/transactions.js"
import { getUsdtExMessage } from "../messages/getUsdtExMessage.js"
import { getForexMessage } from "../messages/getForexMessage.js"
import ExcelJS from 'exceljs'
import { InputFile } from "grammy"
import { InlineKeyboard } from "grammy"

export const handleBotReply = async (ctx) => {
    try {
        // Get the text of the original bot message that the user is replying to
        const originalBotMessage = ctx.message.reply_to_message.text || '';
        // Get the user's reply text and full text
        const userReply = ctx.message.text.toLowerCase().trim();
        const fullText = ctx.message.text.trim();

        // Handle code/код command
        if (userReply === 'code' || userReply === 'код') {
            const code = await getNewCode();
            await ctx.reply(
                `<blockquote>#code</blockquote>\n` +
                `🔐 <b>CODE:</b> <code>${code}</code>`,
                { parse_mode: 'HTML' }
            );
            return true;
        }

        // Handle token/токен command
        if (userReply === 'token' || userReply === 'токен') {
            const token = await getNewToken();
            await ctx.reply(
                `<blockquote>#token</blockquote>\n` +
                `🔑 <b>TOKEN:</b> <code>${token}</code>`,
                { parse_mode: 'HTML' }
            );
            return true;
        }

        // Handle ticket/тикет command with parameters
        const ticketMatch = fullText.match(/^(?:ticket|тикет)\s+(\S+)\s+(?:@)?(\S+)\s+(?:@)?(\S+)\s+(\d+(?:[\s,]\d+)*)(?:\s+(.+))?$/i);
        if (ticketMatch) {
            const [, city, sender, receiver, amountStr, sign] = ticketMatch;
            const code = await getNewCode();
            const amount = `<code>${amountStr}</code>` + ' ' + (sign ? sign : '');

            await ctx.reply(
                `📍 ${city}\n` +
                `➡️ Отдаёт: ${sender}\n` +
                `⬅️ Принимает: ${receiver}\n` +
                `💰 Сумма: ${amount}\n` +
                `🔐 Код: <code>${code}</code>`,
                { parse_mode: 'HTML' }
            );
            return true;
        } else if (userReply === 'ticket' || userReply === 'тикет') {
            await ctx.reply('Чтобы создать тикет, отправь команду в формате: \n' +
                '<code>/тикет Название @username @username 1000$</code>', {parse_mode: 'HTML'});
            return true;
        }

        // Handle messages/уведоми command with text
        const messageMatch = fullText.match(/^(?:messages|уведоми)\s+(.+)$/i);
        if (messageMatch) {
            if (!await isUser2Lvl(ctx)) {
                return false;
            }

            const text = messageMatch[1];
            const [chatIds] = await db.execute('SELECT chat_id FROM accounts');
            
            let successCount = 0;
            let failCount = 0;

            for (const {chat_id} of chatIds) {
                try {
                    await ctx.api.sendMessage(chat_id, text, { parse_mode: 'HTML' });
                    successCount++;
                } catch (error) {
                    failCount++;
                }
            }

            await ctx.reply(
                `✅ Уведомление отправлено:\n` +
                `├ Успешно: ${successCount}\n` +
                `└ Не доставлено: ${failCount}`,
                { parse_mode: 'HTML' }
            );
            return true;
        } else if (userReply === 'messages' || userReply === 'уведоми') {
            await ctx.reply('Укажите текст уведомления после команды.\nПример: messages Важное сообщение');
            return true;
        }

        // Handle create/создай command with name
        const createMatch = fullText.match(/^(?:create|создай)\s+(.+)$/i);
        if (createMatch) {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const name = createMatch[1];
            try {
                await createNewAccount(ctx.chat.id, name);
                await ctx.reply(
                    `<blockquote>#${name}</blockquote> \n` +
                    `<i>"Счета USDT, RUB, USD, EUR созданы"</i>`,
                    {parse_mode: 'HTML'}
                );
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    await ctx.reply('❌ Аккаунт в этой группе уже существует, отправьте <code>/б</code> что бы узнать подробнее',
                    {parse_mode: 'HTML'});
                } else {
                    await ctx.reply('❌ Произошла ошибка при создании аккаунта');
                    throw error;
                }
            }
            return true;
        } else if (userReply === 'create' || userReply === 'создай') {
            await ctx.reply('Пожалуйста, укажите название аккаунта.\nПример: <code>create Основной</code>', {parse_mode: 'HTML'});
            return true;
        }

        // Handle add/добавь command with currency
        const addMatch = fullText.match(/^(?:add|добавь)\s+(.+)$/i);
        if (addMatch) {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const currency = addMatch[1].toUpperCase();
            try {
                const account = await getAccountByChat(ctx.chat.id);
                
                if (!account) {
                    await ctx.reply(
                        '❌ В этом чате нет аккаунта.\n' +
                        'Создайте его командой: <code>create Название</code>', 
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }

                await createNewBalance(account.id, currency);
                
                await ctx.reply(
                    `<blockquote>#${account.name}</blockquote>\n\n` +
                    `<i>"Счет ${currency} добавлен"</i>`,
                    {parse_mode: 'HTML', reply_markup: undoCreatingNewBalanceMenu}
                );

                const balance = await getBalanceByAccountIdAndCurrency(account.id, currency);
                await createNewTransaction(balance[0].id, ctx.from.id, account.id, 0, `СОЗДАНИЕ СЧЕТА`, 0, ctx.message.message_id, currency);

            } catch (error) {
                if (error.message === 'CURRENCY_EXISTS') {
                    await ctx.reply(
                        '❌ Такой счет уже существует в этом аккаунте',
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }
                console.error('Error in add command:', error);
                await ctx.reply('❌ Произошла ошибка при добавлении счета');
                throw error;
            }
            return true;
        } else if (userReply === 'add' || userReply === 'добавь') {
            await ctx.reply('Укажите валюту.\nПример: <code>add USDT</code>', {parse_mode: 'HTML'});
            return true;
        }

        // Handle remove/удали command with currency
        const removeMatch = fullText.match(/^(?:remove|удали)\s+(.+)$/i);
        if (removeMatch) {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const currency = removeMatch[1].toUpperCase();
            try {
                const account = await getAccountByChat(ctx.chat.id);
                
                if (!account) {
                    await ctx.reply(
                        '❌ В этом чате нет аккаунта.\n' +
                        'Создайте его командой: <code>create Название</code>', 
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }

                const balance = await getBalanceByAccountIdAndCurrency(account.id, currency);
                await deleteBalanceByName(account.id, currency);
                await createNewTransaction(balance[0].id, ctx.from.id, account.id, -balance[0].balance, `УДАЛЕНИЕ СЧЕТА`, 0, ctx.message.message_id, currency);
                
                await ctx.reply(
                    `<blockquote>#${account.name}</blockquote>\n\n` +
                    `<i>"Счет ${currency} удален"</i>`,
                    {parse_mode: 'HTML', reply_markup: undoDeletingNewBalanceMenu}
                );
            } catch (error) {
                if (error.message === 'BALANCE_NOT_FOUND') {
                    await ctx.reply(
                        '❌ Такой счет не существует в этом аккаунте',
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }
                console.error('Error in remove command:', error);
                await ctx.reply('❌ Произошла ошибка при удалении счета');
                throw error;
            }
            return true;
        } else if (userReply === 'remove' || userReply === 'удали') {
            await ctx.reply('Укажите валюту.\nПример: <code>remove USDT</code>', {parse_mode: 'HTML'});
            return true;
        }

        // Handle clear/очисти command with currency
        const clearMatch = fullText.match(/^(?:clear|очисти)\s+(.+)$/i);
        if (clearMatch) {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const currency = clearMatch[1].toUpperCase();
            try {
                const account = await getAccountByChat(ctx.chat.id);
                
                if (!account) {
                    await ctx.reply(
                        '❌ В этом чате нет аккаунта.\n' +
                        'Создайте его командой: <code>create Название</code>', 
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }

                const oldBalance = await getBalanceByAccountIdAndCurrency(account.id, currency);
                await resetBalance(account.id, currency);
                await createNewTransaction(oldBalance[0].id, ctx.from.id, account.id, -oldBalance[0].balance, `ОЧИСТКА СЧЕТА`, 0, ctx.message.message_id, currency);
                
                await ctx.reply(
                    `<blockquote>#${account.name}</blockquote>\n\n` +
                    `✅ Баланс ${currency} обнулен`,
                    {parse_mode: 'HTML', reply_markup: undoClearingBalanceMenu}
                );
            } catch (error) {
                if (error.message === 'BALANCE_NOT_FOUND') {
                    await ctx.reply(
                        '❌ Такой счет не существует в этом аккаунте',
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }
                console.error('Error in clear command:', error);
                await ctx.reply('❌ Произошла ошибка при обнулении счета');
                throw error;
            }
            return true;
        } else if (userReply === 'clear' || userReply === 'очисти') {
            await ctx.reply('Укажите валюту.\nПример: <code>clear USDT</code>', {parse_mode: 'HTML'});
            return true;
        }

        // Handle reset/сброс command
        if (userReply === 'reset' || userReply === 'сброс') {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const account = await getAccountByChat(ctx.chat.id);
            if (!account) {
                await ctx.reply('❌ В этом чате нет аккаунта', {parse_mode: 'HTML'});
                return true;
            }

            await deleteAccountByChat(ctx.chat.id);
            await ctx.reply(`❌ Аккаунт <code>#${account.name}</code> в этом чате успешно удален`, {parse_mode: 'HTML'});
            return true;
        }

        // Handle send_users/отправь command with text
        const sendUsersMatch = fullText.match(/^(?:send_users|отправь)\s+(.+)$/i);
        if (sendUsersMatch) {
            if (!await isUser2Lvl(ctx)) {
                return false;
            }

            const text = sendUsersMatch[1];
            const [users] = await db.execute('SELECT id FROM users');
            
            let successCount = 0;
            let failCount = 0;

            for (const {id} of users) {
                try {
                    await ctx.api.sendMessage(id, text, { parse_mode: 'HTML' });
                    successCount++;
                } catch (error) {
                    failCount++;
                }
            }

            await ctx.reply(
                `✅ Сообщение отправлено пользователям:\n` +
                `├ Успешно: ${successCount}\n` +
                `└ Не доставлено: ${failCount}`,
                { parse_mode: 'HTML' }
            );
            return true;
        } else if (userReply === 'send_users' || userReply === 'отправь') {
            await ctx.reply('Укажите текст сообщения после команды.\nПример: send_users Important message');
            return true;
        }

        // Handle xe command
        if (userReply === 'xe') {
            if (!await isAdmin(ctx)) {
                return false;
            }
            const message = await getXERatesMessage(ctx);
            await ctx.reply(message, {parse_mode: 'HTML', disable_web_page_preview: true});
            return true;
        }

        // Handle city/город command
        if (userReply === 'city' || userReply === 'город') {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const moscow = await getMoscow();
            const makhachkala = await getMakhachkala();

            await ctx.reply(    
                `🏙️ <b>Москва</b> - CoinSwap \n` +
                `<b>├ Купить</b> - ${nCode(moscow.buy_price)} ₽\n` +
                `<b>└ Продать</b> - ${nCode(moscow.sell_price)} ₽\n\n` +
                `🌄 <b>Махачкала</b> - CoinSwap\n` +
                `<b>├ Купить</b> - ${nCode(makhachkala.buy_price)} ₽\n` +
                `<b>└ Продать</b> - ${nCode(makhachkala.sell_price)} ₽`,
                { parse_mode: "HTML" }
            );
            return true;
        }

        // Handle USDT-Ex command
        if (userReply === 'usdt_ex' || userReply === 'usdt') {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const message = await getUsdtExMessage(ctx);
            await ctx.reply(message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            return true;
        }

        // Handle Ex command
        if (userReply === 'ex' || userReply === 'хе') {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const message = '🌍 <b>XE</b> в разработке.\n\n <a href="https://www.xe.com">А пока можете посмотреть курсы в ручную.</a>';
            await ctx.reply(message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            return true;
        }

        // Handle Forex command
        if (userReply === 'forex' || userReply === 'форекс') {
            if (!await isAdmin(ctx)) {
                return false;
            }

            const message = await getForexMessage(ctx);
            await ctx.reply(message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            return true;
        }

        // Handle ABCEX command
        if (userReply === 'abc' || userReply === 'абц') {
            const message = await getABCEXCommandMessage();
            await ctx.reply(message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            return true;
        }

        // Handle Moscow rate command
        if (userReply === 'msc' || userReply === 'мск') {
            const moscow = await getMoscow();
            await ctx.reply(
                `<b>🏙️ Москва</b> - CoinSwap\n` +
                `<b>├ Купить</b> - ${nCode(moscow.buy_price)} ₽\n` +
                `<b>└ Продать</b> - ${nCode(moscow.sell_price)} ₽`,
                { parse_mode: "HTML" }
            );
            return true;
        }

        // Handle Makhachkala rate command
        if (userReply === 'mcx' || userReply === 'мхл') {
            const makhachkala = await getMakhachkala();
            await ctx.reply(
                `<b>🌄 Махачкала</b> - CoinSwap\n` +
                `<b>├ Купить</b> - ${nCode(makhachkala.buy_price)} ₽\n` +
                `<b>└ Продать</b> - ${nCode(makhachkala.sell_price)} ₽`,
                { parse_mode: "HTML" }
            );
            return true;
        }

        // Handle balance check command
        if (userReply === 'b' || userReply === 'б') {
            if(isPrivate(ctx)) {
                return false;
            }

            const account = await getAccountByChat(ctx.chat.id);
            
            if (!account) {
                await ctx.reply(
                    '❌ В этом чате нет аккаунта.\n' +
                    'Создайте его командой: <code>/создай Название</code>', 
                    {parse_mode: 'HTML'}
                );
                return true;
            }

            const balances = await getAccountBalances(account.id);
            
            if (!balances.length) {
                await ctx.reply(
                    `<blockquote>#${account.name}</blockquote>\n` +
                    'На этом аккаунте нет счетов',
                    {parse_mode: 'HTML'}
                );
                return true;
            }

            const balanceLines = balances.map(b => 
                `${b.currency}: ${nFormat(b.balance)}`
            ).join('\n');

            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                balanceLines,
                {parse_mode: 'HTML'}
            );
            return true;
        }

        // Handle summary/report command
        if (userReply === 'summ' || userReply === 'выписка') {
            try {
                const account = await getAccountByChat(ctx.chat.id);
                
                if (!account) {
                    await ctx.reply(
                        '❌ В этом чате нет аккаунта.\n' +
                        'Создайте его командой: <code>/создай Название</code>', 
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }

                // Get all transactions
                const [transactions] = await db.execute(
                    `SELECT 
                        t.created_at,
                        t.currency,
                        t.amount,
                        u.username as user_username,
                        a.name as account_name,
                        t.comment,
                        t.current_balance
                    FROM transactions t
                    LEFT JOIN users u ON t.user_id = u.id
                    LEFT JOIN accounts a ON t.account_id = a.id
                    WHERE t.account_id = ? AND t.is_shown = TRUE
                    ORDER BY t.created_at DESC`,
                    [account.id]
                );

                if (!transactions.length) {
                    await ctx.reply(
                        `<blockquote>#${account.name}</blockquote>\n` +
                        'Транзакции отсутствуют',
                        {parse_mode: 'HTML'}
                    );
                    return true;
                }

                // Create Excel report
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Выписка');

                // Define columns
                worksheet.columns = [
                    { header: 'Дата', key: 'date', width: 12 },
                    { header: 'Валюта', key: 'currency', width: 10 },
                    { header: 'Сумма', key: 'amount', width: 15 },
                    { header: 'Пользователь', key: 'username', width: 20 },
                    { header: 'Счет', key: 'account', width: 15 },
                    { header: 'Комментарий', key: 'comment', width: 35 },
                    { header: 'Остаток', key: 'balance', width: 15 }
                ];

                // Style the header row
                const headerRow = worksheet.getRow(1);
                headerRow.font = {
                    name: 'Arial',
                    size: 11,
                    bold: true,
                    color: { argb: 'FFFFFF' }
                };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '4472C4' }
                };
                headerRow.alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                };

                // Add data and style each row
                transactions.forEach((tx, index) => {
                    const date = new Date(tx.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    });

                    const row = worksheet.addRow({
                        date: date,
                        currency: tx.currency,
                        amount: tx.amount,
                        username: tx.user_username ? `@${tx.user_username}` : '',
                        account: tx.account_name,
                        comment: tx.comment || '',
                        balance: tx.current_balance
                    });

                    // Alternate row colors
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' }
                    };

                    // Style amounts and balance
                    const amountCell = row.getCell('amount');
                    const balanceCell = row.getCell('balance');

                    [amountCell, balanceCell].forEach(cell => {
                        cell.value = nFormat(cell.value);
                        cell.numFmt = '#,##0.00';
                        cell.font = {
                            name: 'Arial',
                            size: 11,
                            color: { argb: parseFloat(cell.value.replace(/,/g, '')) < 0 ? 'FF0000' : '008000' }
                        };
                    });

                    // Center currency and username
                    row.getCell('currency').alignment = { horizontal: 'center' };
                    row.getCell('username').alignment = { horizontal: 'left' };
                });

                // Add borders to all cells
                worksheet.eachRow((row) => {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'D9D9D9' } },
                            left: { style: 'thin', color: { argb: 'D9D9D9' } },
                            bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
                            right: { style: 'thin', color: { argb: 'D9D9D9' } }
                        };
                        if (!cell.font) {
                            cell.font = { name: 'Arial', size: 11 };
                        }
                    });
                });

                // Generate buffer
                const buffer = await workbook.xlsx.writeBuffer();

                // Send document
                await ctx.replyWithDocument(
                    new InputFile(
                        buffer,
                        `выписка_${account.name}_${Date.now()}.xlsx`
                    ),
                    {
                        caption: `<blockquote>#${account.name}</blockquote>\nВыписка по счету`,
                        parse_mode: 'HTML'
                    }
                );
                return true;

            } catch (error) {
                console.error('Error in summary/report command:', error);
                await ctx.reply('❌ Произошла ошибка при создании выписки');
                return true;
            }
        }

        await ctx.reply('Я получил ваше сообщение. Чем могу помочь?');
        return true;
    } catch (error) {
        console.error('Error handling bot reply:', error);
        return false;
    }
}; 