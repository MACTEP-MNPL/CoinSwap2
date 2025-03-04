import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"

export const getABCEXCommandMessage = async (ctx) => {
    const {
        ABCEXBuyDollar,
        ABCEXSellDollar
    } = api

    const message = `<a href="https://abcex.io/client/exchange/USDTRUB">ABCEX</a>\n` +
        `<blockquote>b - <code>${nFormat(ABCEXBuyDollar)}</code>\n` +
        `s - <code>${nFormat(ABCEXSellDollar)}</code></blockquote>`

    return message
} 