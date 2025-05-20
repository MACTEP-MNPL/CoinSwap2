import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"

export const getXERatesMessage = async (ctx) => {
    const { XEDollar, XEEUro, XEGBP, XECNY, XEKRW, XETimestamp } = api

    return (
        `<blockquote>1 EUR = <code>${nFormat(XEEUro)}</code> USD\n\n` +
        `1 USD = <code>${nFormat(XEDollar)}</code> EUR\n\n` +
        `1 USD = <code>${nFormat(XEGBP)}</code> GBP\n\n` +
        `1 USD = <code>${nFormat(XECNY)}</code> CNY\n\n` +
        `1 USD = <code>${nFormat(XEKRW)}</code> KRW\n</blockquote>` +
        `\n${new Date(XETimestamp).toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        }).replace(',', ' |')} <a href="https://xe.com">xe.com</a>`
    )
} 