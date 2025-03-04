import { Composer } from "grammy";
import { getMoscow, getMakhachkala } from "../db/cities.js";
import { nCode } from "../utils/n.js";
import { isAdmin } from "../utils/userLvl.js";
import { getUsdtExMessage } from "../messages/getUsdtExMessage.js";
import { getForexMessage } from "../messages/getForexMessage.js";
export const duplicateCommands = new Composer();

duplicateCommands.command("city", async (ctx) => {
    if (!await isAdmin(ctx)) {
        return;
    }

    const moscow = await getMoscow();
    const makhachkala = await getMakhachkala();

    await ctx.reply(    
        `🏙️ <b>Москва</b> - CoinSwap \n` +
        `<b>├ Купить</b> - ${nCode(moscow.buy_price)} ₽\n` +
        `<b>└ Продать</b> - ${nCode(moscow.sell_price)} ₽\n\n` +
        `🌄 <b>Махачкала</b> - CoinSwap\n` +
        `<b>├ Купить</b> - ${nCode(makhachkala.buy_price)} ₽\n` +
        `<b>└ Продать</b> - ${nCode(makhachkala.sell_price)} ₽`, {
        parse_mode: "HTML"
    });
});

// Duplicate of "💹 USDT-Ex" button
duplicateCommands.command("usdt_ex", async (ctx) => {
    if (await isAdmin(ctx)) {
        const message = await getUsdtExMessage(ctx);
        await ctx.reply(message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
    }
});

// Duplicate of Ex button
duplicateCommands.command("ex", async (ctx) => {
    if(await isAdmin(ctx)) {
        const message = '🌍 <b>XE</b> в разработке.\n\n <a href="https://www.xe.com">А пока можете посмотреть курсы в ручную.</a>'
        await ctx.reply(message, {parse_mode: 'HTML', disable_web_page_preview: true})
    }
});

// Duplicate of Forex button
duplicateCommands.command("forex", async (ctx) => {
    if (await isAdmin(ctx)) {
        const message = await getForexMessage(ctx);
        await ctx.reply(message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
    }
});
