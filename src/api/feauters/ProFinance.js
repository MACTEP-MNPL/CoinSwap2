import axios from "axios"
import { HttpsProxyAgent } from "https-proxy-agent"
import * as cheerio from "cheerio"
import { PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD } from "../../bot.js"


const getFourSymbolsAfterEurRub = (data) => {
    const preprocessedData = data.replace(/[\u2028\u2029\n\t]/g, '').trim()
    const str = preprocessedData.replace(/\s/g, '').slice(Math.floor(preprocessedData.length / 2))

    const index = str.indexOf("EUR/RUB")

    const substring = str.substring(index + 7)

    return substring.slice(0, 5)
}

export const getProFinanceEuro = async () => {

    const proxyAgent = new HttpsProxyAgent(`http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`)

    const response = (await axios.get("https://www.profinance.ru/", {
        httpsAgent: proxyAgent
    })).data
    
    const $ = cheerio.load(response)

    const data = $(`body`)

    return getFourSymbolsAfterEurRub(data.text())
}

const getFourSymbolsAfterUsdRub = (data) => {
    const preprocessedData = data.replace(/[\u2028\u2029\n\t]/g, '').trim()
    const str = preprocessedData.replace(/\s/g, '').slice(Math.floor(preprocessedData.length / 2))

    const index = str.indexOf("USD/RUB")

    const substring = str.substring(index + 7)

    return substring.slice(0, 5)
}

export const getProFinanceDollar = async () => {
    const proxyAgent = new HttpsProxyAgent(`http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`)

    const response = (await axios.get("https://www.profinance.ru/", {
        httpsAgent: proxyAgent
    })).data

    const $ = cheerio.load(response)

    const data = $(`body`)

    return getFourSymbolsAfterUsdRub(data.text())
}
