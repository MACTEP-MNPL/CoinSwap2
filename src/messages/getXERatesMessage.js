import { api } from "../bot.js"

export const getXERatesMessage = async (ctx) => {
    const { EURtoUSD, USDtoEUR, USDtoGBP, USDtoCNY, USDtoKRW } = api

    return (
        `💱 Курсы валют (XE.com)\n\n` +
        `1 EUR = <code>${EURtoUSD}</code> USD\n\n` +
        `1 USD = <code>${USDtoEUR}</code> EUR\n\n` +
        `1 USD = <code>${USDtoGBP}</code> GBP\n\n` +
        `1 USD = <code>${USDtoCNY}</code> CNY\n\n` +
        `1 USD = <code>${USDtoKRW}</code> KRW\n`
    )
} 