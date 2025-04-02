import { getCBRFDollar, getCBRFEuro } from './feauters/CBRF.js'
import { nFormat } from '../utils/n.js'
import { getProFinanceDollar, getProFinanceEuro } from './feauters/ProFinance.js'
import { getRapiraBuyDollar, getRapiraSellDollar } from './feauters/Rapira.js'
import { ABCEXBuyDollar, ABCEXSellDollar } from './feauters/ABCEX.js'
import { getRussianStocksScanner } from './feauters/TradingViewScanner.js'
import { getMoscaBuyDollar, getMoscaSellDollar } from './feauters/Mosca.js'

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
        this.ABCEXBuyDollar = 0
        this.ABCEXSellDollar = 0
        this.RussianStocks = []
        this.timestamp = 0
        this.timestampFast = 0
        this.timestampSlow = 0
        this.MoscaBuyDollar = 0
        this.MoscaSellDollar = 0
        
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

            this.MoscaBuyDollar = await getMoscaBuyDollar()
            this.MoscaSellDollar = await getMoscaSellDollar()

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

            this.InvestingDollar = //await getInvestingDollar()
            this.InvestingEuro = //await getInvestingEuro()

            this.RussianStocks = await getRussianStocksScanner()

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