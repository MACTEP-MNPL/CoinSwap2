import { api } from "../bot.js"
import { nFormat, nForm  } from "../utils/n.js"

export const getGarantexCommandMessage = async () => {
    const {
        GarantexBuyDollar,
        GarantexSellDollar,
        GarantexUsdtUsdBuyPrice,
        GarantexUsdtUsdSellPrice,
        GarantexBtcRubPrice,
        GarantexEthRubPrice
    } = api

    const message = `<a href="https://garantex.org/trading/usdtrub">Garantex</a>\n` +
        `<blockquote>b - <code>${nFormat(GarantexBuyDollar)}</code>\n` +
        `s - <code>${nFormat(GarantexSellDollar)}</code>\n` +
        `b - <code>${GarantexUsdtUsdBuyPrice}</code> $\n` +
        `s - <code>${GarantexUsdtUsdSellPrice}</code> $\n` +
        `BTC/RUB - <code>${nForm(GarantexBtcRubPrice)}</code>\n` +
        `ETH/RUB - <code>${nForm(GarantexEthRubPrice)}</code></blockquote>`

    return message
}
