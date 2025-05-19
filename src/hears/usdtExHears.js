import { Composer } from "grammy";
import { getUsdtExMessage } from "../messages/getUsdtExMessage.js";
import { isAdmin } from "../utils/userLvl.js";
import { isPrivate } from "../utils/isPrivate.js";
import { InlineKeyboard } from "grammy";

const updateKeyboard = new InlineKeyboard()
    .text("🔄 Обновить", "update-ex");

export const usdtExHears = new Composer()

usdtExHears.hears('💹 USDT-EX', async (ctx) => {
    if (!isPrivate(ctx)) return;
    if (!await isAdmin(ctx)) return;

    const message = await getUsdtExMessage(ctx);
    await ctx.reply(message, {
        parse_mode: 'HTML', 
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
});

// Handle callback query for update button
usdtExHears.callbackQuery("update-ex", async (ctx) => {
    if (!await isAdmin(ctx)) return;
    
    const message = await getUsdtExMessage(ctx);
    await ctx.deleteMessage();
    await ctx.reply(message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
    await ctx.answerCallbackQuery();
});


