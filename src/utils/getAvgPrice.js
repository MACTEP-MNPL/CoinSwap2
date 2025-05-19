export const getAvgBuyRate = (api) => {
    const {
        RapiraBuyDollar, 
        ABCEXBuyDollar, 
        MoscaBuyDollar, 
        GrinexBuyDollar
    } = api
    
    const validRates = [RapiraBuyDollar, ABCEXBuyDollar, MoscaBuyDollar, GrinexBuyDollar]
    .map(Number)
    .filter(rate => !isNaN(rate));

    const avgRate = validRates.length ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length : 0;

    return avgRate
}

export const getAvgSellRate = (api) => {
    const {
        RapiraSellDollar, 
        ABCEXSellDollar, 
        MoscaSellDollar, 
        GrinexSellDollar
    } = api

    const validRates = [RapiraSellDollar, ABCEXSellDollar, MoscaSellDollar, GrinexSellDollar]
    .map(Number)
    .filter(rate => !isNaN(rate));

    const avgRate = validRates.length ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length : 0;

    return avgRate
}
