import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"

export const getUsdtExMessage = async (ctx) => {

    const {
        RapiraBuyDollar, 
        RapiraSellDollar, 
        ABCEXBuyDollar, 
        ABCEXSellDollar, 
        GarantexBuyDollar, 
        GarantexSellDollar,
        GarantexUsdUsdtBuyDifference,
        GarantexUsdUsdtSellDifference,
        timestampFast
    } = api

    const avgBuyRate = (Number(RapiraBuyDollar) + Number(ABCEXBuyDollar) + Number(GarantexBuyDollar)) / 3;
    const avgSellRate = (Number(RapiraSellDollar) + Number(ABCEXSellDollar) + Number(GarantexSellDollar)) / 3;

    return (
        `⚪️ <a href="https://rapira.ru/exchange/usdt-rub">Rapira</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(RapiraBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(RapiraSellDollar)}</code> ₽\n` +
        `\n` +
        `🔵 <a href="https://abcex.com/exchange/usdt-rub">ABCEX</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(ABCEXBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(ABCEXSellDollar)}</code> ₽\n` +
        `\n` +
        `🟢 <a href="https://garantex.org/exchange/usdt-rub">Garantex</a>\n` +
        `<b>├</b> Купить: <code>${nFormat(GarantexBuyDollar)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(GarantexSellDollar)}</code> ₽\n` +
        `\n` +
        `💵 <a href="https://garantex.org/exchange/usdt-usd">USD/USDT</a>\n` +
        `<b>├</b> Купить: <code>${GarantexUsdUsdtBuyDifference}</code>\n` +
        `<b>└</b> Продать: <code>${GarantexUsdUsdtSellDifference}</code>\n` +
        `\n` +
        `*️⃣ <b>Средний курс</b>\n` +
        `<b>├</b> Купить: <code>${nFormat(avgBuyRate)}</code> ₽\n` +
        `<b>└</b> Продать: <code>${nFormat(avgSellRate)}</code> ₽\n` +
        `\n` +
        `${timestampFast}`
    )   
}
