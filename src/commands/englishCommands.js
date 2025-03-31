import { Composer } from "grammy"
import { getNewCode } from "../db/codes.js"
import { getNewToken } from "../db/tokens.js"
import { isUser2Lvl, isAdmin } from "../utils/userLvl.js"
import { db } from "../bot.js"
import { createNewAccount, getAccountByChat, getAccountBalances } from "../db/accounts.js"
import { nFormat, nCode } from "../utils/n.js"
import { getMoscow, getMakhachkala } from "../db/cities.js"
import { createNewBalance, deleteBalanceByName, resetBalance, getBalanceByAccountIdAndCurrency } from "../db/balances.js"
import { undoCreatingNewBalanceMenu, undoClearingBalanceMenu, undoDeletingNewBalanceMenu } from "../menus/undoMenus.js"
import { deleteAccountByChat } from "../db/accounts.js"
import ExcelJS from 'exceljs'
import { getABCEXCommandMessage } from "../messages/getABCEXCommandMessage.js"
import { InputFile } from "grammy"
import { InlineKeyboard } from "grammy"


export const englishCommands = new Composer()

// /token command (copy of /токен)
englishCommands.command('token', async (ctx) => {
    const token = await getNewToken()
    await ctx.reply(`<blockquote>#token</blockquote> \n` +
        `🔑 <b>TOKEN:</b> <code>${token}</code>`, {parse_mode: 'HTML'})
})

// /messages command (copy of /уведоми)
englishCommands.command('messages', async (ctx) => {
    if (!await isUser2Lvl(ctx)) {
        return
    }

    const text = ctx.message.text.slice(9).trim()

    if (!text) {
        await ctx.reply('Укажите текст уведомления после команды.\nПример: /messages Важное сообщение')
        return
    }

    try {
        const [chatIds] = await db.execute('SELECT chat_id FROM accounts')
        console.log(chatIds)
        
        let successCount = 0
        let failCount = 0

        for (const {chat_id} of chatIds) {
            try {
                await ctx.api.sendMessage(chat_id, text, { parse_mode: 'HTML' })
                successCount++
            } catch (error) {
                failCount++
            }
        }

        await ctx.reply(
            `✅ Уведомление отправлено:\n` +
            `├ Успешно: ${successCount}\n` +
            `└ Не доставлено: ${failCount}`,
            { parse_mode: 'HTML' }
        )

    } catch (error) {
        console.error('Error sending notifications:', error)
        await ctx.reply('❌ Произошла ошибка при отправке уведомлений')
    }
})

// /create command (copy of /создать)
englishCommands.command('create', async (ctx) => {

    if (!await isAdmin(ctx)) {
        return
    }

    const name = ctx.message.text.split(' ')[1];
    
    if (!name) {
        await ctx.reply('Пожалуйста, укажите название аккаунта.\nПример: <code>/create Основной</code>', {parse_mode: 'HTML'});
        return;
    }

    try {
        const accountId = await createNewAccount(ctx.chat.id, name);
        await ctx.reply(
            `<blockquote>#${name}</blockquote> \n` +
            `"<i>Счета USDT, RUB, USD, EUR созданы</i>"`,
            {parse_mode: 'HTML'}
        );
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            await ctx.reply('❌ Аккаунт в этой группе уже существует, отправьте <code>/б</code> что бы узнать подробнее',
            {parse_mode: 'HTML'})
        } else {
            await ctx.reply('❌ Произошла ошибка при создании аккаунта');
            throw error;
        }
    }
})

englishCommands.command('add', async (ctx) => {

    if (!await isAdmin(ctx)) {
        return;
    }

    try {
        const currency = ctx.message.text.split(' ')[1]?.toUpperCase();
        
        if (!currency) {
            await ctx.reply('Укажите валюту.\nПример: <code>/add USDT</code>', {parse_mode: 'HTML'});
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

        await createNewBalance(account.id, currency);
        
        await ctx.reply(
            `<blockquote>#${account.name}</blockquote>\n\n` +
            `<i>"Счет ${currency} добавлен"</i>`,
            {parse_mode: 'HTML', reply_markup: undoCreatingNewBalanceMenu}
        );

        const balance = await getBalanceByAccountIdAndCurrency(account.id, currency);

        await createNewTransaction(balance[0].id, ctx.from.id, account.id, 0,`СОЗДАНИЕ СЧЕТА`, 0, ctx.message.message_id, currency)

    } catch (error) {
        if (error.message === 'CURRENCY_EXISTS') {
            await ctx.reply(
                '❌ Такой счет уже существует в этом аккаунте',
                {parse_mode: 'HTML'}
            );
            return;
        }
        console.error('Error in /add command:', error);
        await ctx.reply('❌ Произошла ошибка при добавлении счета');
        throw error;
    }
})

// /remove command (copy of /удали)
englishCommands.command('remove', async (ctx) => {

    if (!await isAdmin(ctx)) {
        return;
    }

    try {
        const currency = ctx.message.text.split(' ')[1]?.toUpperCase();
        if (!currency) {
            await ctx.reply('Укажите валюту.\nПример: <code>/remove USDT</code>', {parse_mode: 'HTML'});
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

        const balance = await getBalanceByAccountIdAndCurrency(account.id, currency);

        await deleteBalanceByName(account.id, currency);

        await createNewTransaction(balance[0].id, ctx.from.id, account.id, -balance[0].balance,`УДАЛЕНИЕ СЧЕТА`, 0, ctx.message.message_id, currency)
        
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
            return;
        }
        console.error('Error in /remove command:', error);
        await ctx.reply('❌ Произошла ошибка при удалении счета');
        throw error;
    }
})

// /clear command (copy of /очистить)
englishCommands.command('clear', async (ctx) => {

    if (!await isAdmin(ctx)) {
        return;
    }

    try {
        const currency = ctx.message.text.split(' ')[1]?.toUpperCase();
        if (!currency) {
            await ctx.reply('Укажите валюту.\nПример: <code>/del USDT</code>', {parse_mode: 'HTML'});
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

        const oldBalance = await getBalanceByAccountIdAndCurrency(account.id, currency);

        await resetBalance(account.id, currency);

        ctx.session.undos[ctx.message.message_id] = {
            currency: currency,
            account: account,
            amount: oldBalance[0].balance
        }
        
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
            return;
        }
        console.error('Error in /del command:', error);
        await ctx.reply('❌ Произошла ошибка при обнулении счета');
        throw error;
    }
})

// /mcx command (copy of /мхл)
englishCommands.command('mcx', async (ctx) => {
    const makhachkala = await getMakhachkala()
    await ctx.reply(
        `<b>🌄 Махачкала</b> - CoinSwap\n` +
        `<b>├ Покупка</b> - ${nCode(makhachkala.buy_price)} ₽\n` +
        `<b>└ Продажа</b> - ${nCode(makhachkala.sell_price)} ₽`, {
        parse_mode: "HTML"
    })
})

// /msc command (copy of /мск)
englishCommands.command('msc', async (ctx) => {  
    const moscow = await getMoscow()
    await ctx.reply(
        `<b>🏙️ Москва</b> - CoinSwap\n` +
        `<b>├ Покупка</b> - ${nCode(moscow.buy_price)} ₽\n` +
        `<b>└ Продажа</b> - ${nCode(moscow.sell_price)} ₽`, {
        parse_mode: "HTML"
    })
})

englishCommands.command('b', async (ctx) => {
    try {
        const account = await getAccountByChat(ctx.chat.id);
        const requestedCurrency = ctx.message.text.split(' ')[1]?.toUpperCase();
        
        if (!account) {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
        }

        const balances = await getAccountBalances(account.id);
        
        // If no specific currency requested, show all balances
        if (!requestedCurrency) {
            if (!balances.length) {
                await ctx.reply(
                    `<blockquote>#${account.name}</blockquote>\n` +
                    'На этом аккаунте нет счетов',
                    {parse_mode: 'HTML'}
                );
                return;
            }

            const balanceLines = balances.map(b => 
                `${b.currency}: ${nFormat(b.balance)}`
            ).join('\n');

            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                balanceLines,
                {parse_mode: 'HTML'}
            );
            return;
        }

        // If specific currency requested
        const balance = balances.find(b => b.currency.toUpperCase() === requestedCurrency);
        
        if (!balance) {
            await ctx.reply(
                `<blockquote>#${account.name}</blockquote>\n\n` +
                `Счет ${requestedCurrency} не найден`,
                {parse_mode: 'HTML'}
            );
            return;
        }

        await ctx.reply(
            `<blockquote>#${account.name}</blockquote>\n\n` +
            `${balance.currency}: ${nFormat(balance.balance)}`,
            {parse_mode: 'HTML'}
        );

    } catch (error) {
        console.error('Error in /b command:', error);
        await ctx.reply('❌ Произошла ошибка при получении баланса');
        throw error;
    }
});

// Add code command
englishCommands.command('code', async (ctx) => {
    const code = await getNewCode()
    await ctx.reply(`<blockquote>#code</blockquote> \n` +
        `🔑 <b>CODE:</b> <code>${code}</code>`, {parse_mode: 'HTML'})
})

// Add ticket command
englishCommands.command('ticket', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ').trim();
    
    if (!text) {
        await ctx.reply('Чтобы создать тикет, отправь команду в формате: \n' +
            '<code>/ticket @username @username 1000$</code>', {parse_mode: 'HTML'})
        return;
    }

    try {
        
    const [, sender, receiver, amountStr, sign] = ctx.message.text.split(' ')
    const code = await getNewCode()

    const amount = `<code>${amountStr}</code>` + ' ' + (sign ? sign : '')

    await ctx.reply(
        `<blockquote>#тикет</blockquote> \n` +
        `Отдаёт: ${sender}\n` +
        `Принимает: ${receiver}\n` +
            `Сумма: ${amount}\n` +
            `Код: <code>${code}</code>`,
            { parse_mode: 'HTML' }
        )

    } catch (error) {
        console.error('Error in /ticket command:', error);
        await ctx.reply('❌ Произошла ошибка при создании тикета');
        throw error;
    }
})

englishCommands.command('help', async (ctx) => {

    if (!await isAdmin(ctx)) {
        return;
    }

  await ctx.reply(
    `<code>/b</code> - баланс текущего счёта\n` +
    `<code>/code</code> - создать код заявки \n` +
    `<code>/ticket</code> - создать тикет заявки\n` +
    `<code>/token</code> - создать токен заявки\n` +
    `<code>/create</code> - создать новый счёт\n` +
    `<code>/add</code> - добавить новую валюту\n` +
    `<code>/remove</code> - удалить валюту\n` +
    `<code>/del</code> - очистить баланс валюты\n` +
    `<code>/reset</code> - удалить текущий счёт\n` +
    `<code>/abc</code> - курс ABCEX\n` +
    `<code>/forex</code> - курс forex\n` +
    `<code>/usdt_ex</code> - курс USDT на биржах\n` +
    `<code>/city</code> - курс в городах\n` +
    `<code>/xe</code> - кросс курс валют\n` +
    `<code>/mcx</code> - курс в Махачкале\n` +
    `<code>/msc</code> - курс в Москве\n` +
    `<code>/summ</code> - получить все транзакции на аккаунте\n` +
    `<code>/admin</code> - админ панель`, {parse_mode: 'HTML'})
})

englishCommands.command('reset', async (ctx) => {
    if (!await isUser2Lvl(ctx)) {
        return;
    }

    const account = await getAccountByChat(ctx.chat.id);

    if (!account) {
        await ctx.reply('❌ В этом чате нет аккаунта', {parse_mode: 'HTML'});
        return;
    }

    await deleteAccountByChat(ctx.chat.id);

    await ctx.reply(`❌ Аккаунт <code>#${account.name}</code> в этом чате успешно удален`, {parse_mode: 'HTML'});
})

const dropKeyboard = new InlineKeyboard().text('🗑 Сверить выписку', 'drop_summary')

englishCommands.command('summ', async (ctx) => {
    if (!await isAdmin(ctx)) {
        return;
    }

    try {
        const account = await getAccountByChat(ctx.chat.id);
        
        if (!account) {
            await ctx.reply(
                '❌ В этом чате нет аккаунта.\n' +
                'Создайте его командой: <code>/создать Название</code>', 
                {parse_mode: 'HTML'}
            );
            return;
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
            return;
        }

        // Create a new workbook
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

            // Style amounts and balance (red for negative, green for positive)
            const amountCell = row.getCell('amount');
            const balanceCell = row.getCell('balance');

            [amountCell, balanceCell].forEach(cell => {
                // Format the value using nFormat before setting it
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
                parse_mode: 'HTML',
                reply_markup: dropKeyboard
            }
        );

    } catch (error) {
        console.error('Error in /выписка command:', error);
        await ctx.reply('❌ Произошла ошибка при создании выписки');
        throw error;
    }
})

englishCommands.command('abc', async (ctx) => {
    const message = await getABCEXCommandMessage()
    await ctx.reply(message, {parse_mode: 'HTML', disable_web_page_preview: true})
})


