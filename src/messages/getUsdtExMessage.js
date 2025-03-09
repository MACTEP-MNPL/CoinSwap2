import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"

export const getUsdtExMessage = async (ctx) => {

    const {
        RapiraBuyDollar, 
        RapiraSellDollar, 
        ABCEXBuyDollar, 
        ABCEXSellDollar, 
        timestampFast,
        MoscaBuyDollar,
        MoscaSellDollar
    } = api

    const avgBuyRate = (Number(RapiraBuyDollar) + Number(ABCEXBuyDollar)) / 2;
    const avgSellRate = (Number(RapiraSellDollar) + Number(ABCEXSellDollar)) / 2;

    return (
        `⚪️ <a href="https://rapira.net/exchange/USDT_RUB">Rapira</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(RapiraBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(RapiraSellDollar)}</code> ₽\n` +
        `\n` +
        `⚫️ <a href="https://t.me/Mosca67_bot">MOSCA</a>\n` +
        `├ Купить: <code>${nFormat(MoscaBuyDollar)}</code> ₽\n` +
        `└ Продать: <code>${nFormat(MoscaSellDollar)}</code> ₽\n` +
        `\n` +
        `🔵 <a href="https://abcex.io/">ABCEX</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(ABCEXBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(ABCEXSellDollar)}</code> ₽\n` +
        `\n` +
        `*️⃣ <b>Средний курс</b>\n` +
        `<b>├</b> Купить: <code>${nFormat(avgBuyRate)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(avgSellRate)}</code> ₽\n` +
        `\n` +
        `${timestampFast}`
    )   
}
