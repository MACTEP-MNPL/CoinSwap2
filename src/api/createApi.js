import { getCBRFDollar, getCBRFEuro } from './feauters/CBRF.js'
import { nFormat } from '../utils/n.js'
import { getProFinanceDollar, getProFinanceEuro } from './feauters/ProFinance.js'
import { getInvestingDollar, getInvestingEuro } from './feauters/Investing.js'
import { getRapiraBuyDollar, getRapiraSellDollar } from './feauters/Rapira.js'
import { ABCEXBuyDollar, ABCEXSellDollar } from './feauters/ABCEX.js'
import { getRussianStocksScanner } from './feauters/TradingViewScanner.js'
import { 
    GarantexBuyDollar, 
    GarantexSellDollar, 
    GarantexUsdUsdtBuyDifference, 
    GarantexUsdUsdtSellDifference,
    GarantexUsdtUsdBuyPrice,
    GarantexUsdtUsdSellPrice,
    GarantexBtcRubPrice,
    GarantexEthRubPrice
} from './feauters/Garantex.js'
import { getGarantexCommandMessage } from '../messages/getGarantexCommandMessage.js'
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
        this.GarantexBuyDollar = 0
        this.GarantexSellDollar = 0
        this.GarantexUsdUsdtBuyDifference = 0
        this.GarantexUsdUsdtSellDifference = 0
        this.GarantexUsdtUsdBuyPrice = 0
        this.GarantexUsdtUsdSellPrice = 0
        this.GarantexBtcRubPrice = 0
        this.GarantexEthRubPrice = 0
        this.RussianStocks = []
        this.timestamp = 0
        this.timestampFast = 0
        this.timestampSlow = 0
        

        // Run at 0 seconds of every minute
        cron.schedule('* * * * *', async () => {
            console.log("api every update " + new Date().toLocaleString())
            await this.updateFast()
            await this.updateSlow()

            // Run at 30 seconds of every minute
            setTimeout(() => {
                cron.schedule('* * * * *', async () => {
                    console.log("api fast update " + this.timestampFast)
                    await this.updateFast()
                })
            }, 30000)
        })
    
    }
        
        

    async updateFast() {
        this.CBRFDollar = nFormat(await getCBRFDollar()) //pox
        this.CBRFEuro = nFormat(await getCBRFEuro())

        this.ABCEXBuyDollar = nFormat(await ABCEXBuyDollar()) // хз
        this.ABCEXSellDollar = nFormat(await ABCEXSellDollar())

        this.GarantexBuyDollar = nFormat(await GarantexBuyDollar()) // 1 запрос в две секунды
        this.GarantexSellDollar = nFormat(await GarantexSellDollar())

        this.GarantexUsdUsdtBuyDifference = await GarantexUsdUsdtBuyDifference()
        this.GarantexUsdUsdtSellDifference = await GarantexUsdUsdtSellDifference()
        
        this.GarantexUsdtUsdBuyPrice = await GarantexUsdtUsdBuyPrice()
        this.GarantexUsdtUsdSellPrice = await GarantexUsdtUsdSellPrice()
        this.GarantexBtcRubPrice = await GarantexBtcRubPrice()
        this.GarantexEthRubPrice = await GarantexEthRubPrice()

        this.timestampFast = new Date().toLocaleString()
    }

    async updateSlow() {
        this.RapiraBuyDollar = nFormat(await getRapiraBuyDollar()) // 1 запрос в секунду
        this.RapiraSellDollar = nFormat(await getRapiraSellDollar())
        
        this.ProFinanceDollar = nFormat(await getProFinanceDollar())  //pox
        this.ProFinanceEuro = nFormat(await getProFinanceEuro())

        this.InvestingDollar = await getInvestingDollar()
        this.InvestingEuro = await getInvestingEuro()

        this.RussianStocks = await getRussianStocksScanner()

        this.timestampSlow = new Date().toLocaleString()
    }
}