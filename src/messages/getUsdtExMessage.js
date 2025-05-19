import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"


export const getUsdtExMessage = async (ctx) => {

    const {
        RapiraBuyDollar, 
        RapiraSellDollar,         
        ABCEXSellDollar, 
        ABCEXBuyDollar,
        MoscaBuyDollar,
        MoscaSellDollar,
        GrinexBuyDollar,
        GrinexSellDollar,
        timestampFast,
        AVGDollarBuy,
        AVGDollarSell
    } = api


    return (
        `⚪️ <a href="https://rapira.net/?ref=5CHC">Rapira</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(RapiraBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(RapiraSellDollar)}</code> ₽\n` +
        `\n` +
        `⚫️ <a href="https://t.me/Mosca67_bot">MOSCA</a>\n` +
        `├ Купить: <code>${nFormat(MoscaBuyDollar)}</code> ₽\n` +
        `└ Продать: <code>${nFormat(MoscaSellDollar)}</code> ₽\n` +
        `\n` +
        `🟠 <a href="https://grinex.io/invite/BNSebf">Grinex</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(GrinexBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(GrinexSellDollar)}</code> ₽\n` +
        `\n` +
        `🔵 <a href="https://abcex.io/">ABCEX</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(ABCEXBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(ABCEXSellDollar)}</code> ₽\n` +
        `\n` +
        `*️⃣ <b>Средний курс</b>\n` +
        `<b>├</b> Купить: <code>${nFormat(AVGDollarBuy)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(AVGDollarSell)}</code> ₽\n` +
        `\n` +
        `${timestampFast}`
    )   
}
