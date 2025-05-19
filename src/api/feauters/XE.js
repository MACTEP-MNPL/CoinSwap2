import { getXeRatesLastRate } from '../../db/rates.js';

export const getXeRates = async () => {
    const xeRates = await getXeRatesLastRate();
    const {usd_eur, eur_usd, usd_gbp, usd_cny, usd_krw, timestamp} = xeRates
    return {XEDollar: usd_eur, XEEUro: eur_usd, XEGBP: usd_gbp, XECNY: usd_cny, XEKRW: usd_krw, XETimestamp: timestamp}
}
