import {Composer} from "grammy"
import { InlineKeyboard } from "grammy";
import { isPrivate } from "../utils/isPrivate.js";
import { getUsdtExMessage } from "../messages/getUsdtExMessage.js";

const updateKeyboard = new InlineKeyboard()
    .text("🔄 Обновить", "update-start");

export const startCommand = new Composer()

startCommand.command("start", async (ctx) => {
    if (!isPrivate(ctx)) return;

    const message = await getUsdtExMessage(ctx);
    await ctx.reply(message, {
        parse_mode: 'HTML', 
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
});

// Handle callback query for update button
startCommand.callbackQuery("update-start", async (ctx) => {
    
    const message = await getUsdtExMessage(ctx);
    await ctx.deleteMessage();
    await ctx.reply(message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: updateKeyboard
    });
    await ctx.answerCallbackQuery();
});