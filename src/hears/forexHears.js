import { getForexMessage } from '../messages/getForexMessage.js'
import { Composer } from 'grammy'
import { isAdmin } from '../utils/userLvl.js'
import { isPrivate } from '../utils/isPrivate.js'
import { InlineKeyboard } from 'grammy'

const updateKeyboard = new InlineKeyboard()
    .text("🔄 Обновить", "update-forex");

export const forexHears = new Composer()

forexHears.hears('📊 Forex', async (ctx) => {
    if (!isPrivate(ctx)) return;
    if (!await isAdmin(ctx)) return;

    const message = await getForexMessage(ctx);
    await ctx.reply(message, {
        parse_mode: 'HTML', 
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
});

// Handle callback query for update button
forexHears.callbackQuery("update-forex", async (ctx) => {
    const message = await getForexMessage(ctx);
    await ctx.deleteMessage();
    await ctx.reply(message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
    await ctx.answerCallbackQuery();
});

