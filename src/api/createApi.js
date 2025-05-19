import { getCBRFDollar, getCBRFEuro } from './feauters/CBRF.js'
import { nFormat } from '../utils/n.js'
import { getProFinanceDollar, getProFinanceEuro } from './feauters/ProFinance.js'
import { getRapiraBuyDollar, getRapiraSellDollar } from './feauters/Rapira.js'
import { ABCEXBuyDollar, ABCEXSellDollar } from './feauters/ABCEX.js'
import { getRussianStocksScanner } from './feauters/TradingViewScanner.js'
import { getMoscaBuyDollar, getMoscaSellDollar } from './feauters/Mosca.js'
import { getGrinexBuyDollar, getGrinexSellDollar } from './feauters/grinex.js'
import { getXeRates } from './feauters/XE.js'
import { getInvestingDollar, getInvestingEuro } from './feauters/Investing.js'


import cron from 'node-cron'

export class createApi {
    constructor() {
        this.CBRFDollar = 0
        this.CBRFEuro = 0
        this.ProFinanceDollar = 0
        this.ProFinanceEuro = 0
        this.InvestingDollar = 0
        this.InvestingEuro = 0
        this.RapiraBuyDollar = 0
        this.RapiraSellDollar = 0
        this.RussianStocks = []
        this.timestamp = 0
        this.timestampFast = 0
        this.timestampSlow = 0
        this.MoscaBuyDollar = 0
        this.MoscaSellDollar = 0
        this.GrinexBuyDollar = 0
        this.GrinexSellDollar = 0
        this.InvestingDollar = 0
        this.InvestingEuro = 0

        this.AVGDollarBuy = 0
        this.AVGDollarSell = 0

        this.XEDollar = 0
        this.XEEUro = 0
        this.XEGBP = 0
        this.XECNY = 0
        this.XEKRW = 0
        
        // Run updateFast every 30 seconds
        cron.schedule('*/20 * * * * *', async () => {
            console.log("api fast update " + new Date().toLocaleString())
            await this.updateFast()
        })
        
        // Run updateSlow every minute
        cron.schedule('* * * * *', async () => {
            console.log("api slow update " + new Date().toLocaleString())
            await this.updateSlow()
        })
    }
        
    async updateFast() {
        try {
            this.CBRFDollar = nFormat(await getCBRFDollar()) //pox
            this.CBRFEuro = nFormat(await getCBRFEuro())

            this.ABCEXBuyDollar = nFormat(await ABCEXBuyDollar()) // хз
            this.ABCEXSellDollar = nFormat(await ABCEXSellDollar())

            this.MoscaBuyDollar = nFormat(await getMoscaBuyDollar())
            this.MoscaSellDollar = nFormat(await getMoscaSellDollar())

            this.GrinexBuyDollar = nFormat(await getGrinexBuyDollar())
            this.GrinexSellDollar = nFormat(await getGrinexSellDollar())

            this.InvestingDollar = nFormat(await getInvestingDollar())
            this.InvestingEuro = nFormat(await getInvestingEuro())

            const validBuyRates = [this.RapiraBuyDollar, this.ABCEXBuyDollar, this.MoscaBuyDollar, this.GrinexBuyDollar]
            .map(Number)
            .filter(rate => !isNaN(rate));
            const avgBuyRate = validBuyRates.length ? validBuyRates.reduce((sum, rate) => sum + rate, 0) / validBuyRates.length : 0;
            this.AVGDollarBuy = nFormat(avgBuyRate)

            const validSellRates = [this.RapiraSellDollar, this.ABCEXSellDollar, this.MoscaSellDollar, this.GrinexSellDollar]
            .map(Number)
            .filter(rate => !isNaN(rate));
            const avgSellRate = validSellRates.length ? validSellRates.reduce((sum, rate) => sum + rate, 0) / validSellRates.length : 0;
            this.AVGDollarSell = nFormat(avgSellRate)

            const date = new Date()
            date.setHours(date.getHours() + 3)
            this.timestampFast = date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'UTC'
            }).replace(',', ' |')
        } catch (error) {
            console.error('Error updating fast:', error)
        }
    }

    async updateSlow() {
        try {
            this.RapiraBuyDollar = nFormat(await getRapiraBuyDollar()) // 1 запрос в секунду
            this.RapiraSellDollar = nFormat(await getRapiraSellDollar())
            
            this.ProFinanceDollar = nFormat(await getProFinanceDollar())  //pox
            this.ProFinanceEuro = nFormat(await getProFinanceEuro())

            this.InvestingDollar = await getInvestingDollar()
            this.InvestingEuro = await getInvestingEuro()

            this.RussianStocks = await getRussianStocksScanner()

            const {XEDollar, XEEUro, XEGBP, XECNY, XEKRW, XETimestamp} = await getXeRates()

            this.XEDollar = XEDollar
            this.XEEUro = XEEUro
            this.XEGBP = XEGBP
            this.XECNY = XECNY
            this.XEKRW = XEKRW
            XETimestamp.setHours(XETimestamp.getHours() + 3)
            this.XETimestamp = XETimestamp

            const date = new Date()
            
            date.setHours(date.getHours() + 3)
            
            this.timestampSlow = date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'UTC'
            }).replace(',', ' |')

        } catch (error) {
            console.error('Error updating slow:', error)
        }
    }
}