import { Composer } from "grammy"
import { getMoscow, getMakhachkala } from "../db/cities.js"
import { n5 } from "../utils/n.js"
import { isAdmin } from "../utils/userLvl.js"
import { isPrivate } from "../utils/isPrivate.js"
import { InlineKeyboard } from "grammy";

const updateKeyboard = new InlineKeyboard()
    .text("🔄 Обновить", "update-cities");

export const citiesHears = new Composer()

const getCitiesMessage = async () => {
    
    const moscow = await getMoscow()
    const makhachkala = await getMakhachkala()

    return `🏙️ <b>Москва</b> - CoinSwap \n` +
           `<b>├ Купить</b> - <code>${n5(moscow.buy_price)}</code> ₽\n` +
           `<b>└ Продать</b> - <code>${n5(moscow.sell_price)}</code> ₽\n\n` +
           `🌄 <b>Махачкала</b> - CoinSwap\n` +
           `<b>├ Купить</b> - <code>${n5(makhachkala.buy_price)}</code> ₽\n` +
           `<b>└ Продать</b> - <code>${n5(makhachkala.sell_price)}</code> ₽`;
    }

citiesHears.hears("🏙 Города", async (ctx) => {
    if (!isPrivate(ctx)) return;
    if (!await isAdmin(ctx)) return;

    const message = await getCitiesMessage();
    await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: updateKeyboard
    });
});

// Handle callback query for update button
citiesHears.callbackQuery("update-cities", async (ctx) => {
    const message = await getCitiesMessage();
    await ctx.deleteMessage();
    await ctx.reply(message, {
        parse_mode: "HTML",
        reply_markup: updateKeyboard
    });

    await ctx.answerCallbackQuery();
});
