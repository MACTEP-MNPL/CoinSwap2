import { Composer } from "grammy";
import { InputFile } from "grammy";
import ExcelJS from 'exceljs';
import { db } from "../bot.js";
import { isUser2Lvl } from "../utils/userLvl.js";
import { isPrivate } from "../utils/isPrivate.js";

export const totalHears = new Composer()

totalHears.hears('🧾 Сводка', async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if (!await isUser2Lvl(ctx)) {
        return;
    }

    try {
        // Get all unique currencies from balances with proper ordering
        const [currencies] = await db.execute(
            `SELECT DISTINCT currency 
             FROM balances 
             ORDER BY 
                CASE 
                    WHEN currency = 'USDT' THEN 1
                    WHEN currency = 'RUB' THEN 2
                    WHEN currency = 'USD' THEN 3
                    WHEN currency = 'EUR' THEN 4
                    ELSE 5
                END,
                currency ASC`
        );

        const [accounts] = await db.execute(
            `SELECT id, name 
             FROM accounts 
             ORDER BY name`
        );

        // Get current balance for each account-currency combination
        const [balances] = await db.execute(
            `SELECT 
                a.name as account_name,
                b.currency,
                b.balance as balance
             FROM accounts a
             LEFT JOIN balances b ON a.id = b.account_id
             ORDER BY a.name, b.currency`
        );

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Сводка');

        // Prepare columns - first column for account names, then one for each currency
        const columns = [
            { header: 'Счет', key: 'account', width: 20 },
            { header: 'ID', key: 'accountId', width: 10 },
            ...currencies.map(c => ({
                header: c.currency,
                key: c.currency,
                width: 15
            }))
        ];

        worksheet.columns = columns;

        // Style header row
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

        // Add data rows
        accounts.forEach((account, index) => {
            // Prepare row data
            const rowData = {
                account: account.name,
                accountId: account.id
            };

            // Fill in balances for each currency
            currencies.forEach(curr => {
                const balance = balances.find(b => 
                    b.account_name === account.name && 
                    b.currency === curr.currency
                );
                rowData[curr.currency] = balance ? balance.balance : '❌';
            });

            const row = worksheet.addRow(rowData);

            // Style the row
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F2F2F2' }
            };

            // Style each cell in the row
            row.eachCell((cell, colNumber) => {
                if (colNumber === 1) {
                    // Account name styling
                    cell.font = {
                        name: 'Arial',
                        size: 11,
                        bold: true
                    };
                } else if (colNumber === 2) {
                    // Account ID styling - plain text without number formatting
                    cell.font = {
                        name: 'Arial',
                        size: 11
                    };
                    cell.numFmt = '@'; // Text format
                    cell.alignment = { horizontal: 'center' };
                } else {
                    // Balance styling
                    if (cell.value === '❌') {
                        cell.font = {
                            name: 'Arial',
                            size: 11,
                            color: { argb: '808080' } // Grey color for ❌
                        };
                        cell.alignment = { horizontal: 'center' };
                    } else {
                        const value = parseFloat(cell.value) || 0;
                        cell.numFmt = '#,##0.00';
                        cell.font = {
                            name: 'Arial',
                            size: 11,
                            color: { argb: value < 0 ? 'FF0000' : '008000' }
                        };
                        cell.alignment = { horizontal: 'right' };
                    }
                }
            });
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
            });
        });

        // Generate buffer and send
        const buffer = await workbook.xlsx.writeBuffer();
        await ctx.replyWithDocument(
            new InputFile(
                buffer,
                `сводка_${Date.now()}.xlsx`
            ),
            {
                caption: '🧾 Сводка по всем счетам',
                parse_mode: 'HTML'
            }
        );

    } catch (error) {
        console.error('Error in сводка command:', error);
        await ctx.reply('❌ Произошла ошибка при создании сводки');
        throw error;
    }
});