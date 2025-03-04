import { api } from '../bot.js'
import { nFormat } from '../utils/n.js'

export const getForexMessage = async (ctx) => {
    const {CBRFDollar, CBRFEuro} = api
    const {ProFinanceDollar, ProFinanceEuro} = api
    const {InvestingDollar, InvestingEuro} = api
    const {timestampSlow} = api

    const message = 
    `<blockquote><a href="https://www.profinance.ru/charts/usdrub/lc47">ProFinance</a>\n` +
    `$ - <code>${nFormat(ProFinanceDollar)}</code> ₽\n` +
    `€ - <code>${nFormat(ProFinanceEuro)}</code> ₽\n` +
    `\n` +
    `<a href="https://www.investing.com/currencies/usd-rub">Investing</a>\n` + 
    `$ - <code>${nFormat(InvestingDollar)}</code> ₽\n` +
    `€ - <code>${nFormat(InvestingEuro)}</code> ₽\n` +
    `\n` +
    `<a href="https://cbr.ru">ЦБ РФ</a>\n` +
    `$ - <code>${nFormat(CBRFDollar)}</code> ₽\n` +
    `€ - <code>${nFormat(CBRFEuro)}</code> ₽</blockquote>\n` +
    `\n` +
    `${timestampSlow}`

    return message
}
