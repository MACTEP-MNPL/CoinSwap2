import { api } from "../bot.js"
import { nFormat } from "../utils/n.js"

export const getRussianStocksMessage = async () => {
    const { RussianStocks, timestampSlow } = api;

    if (!RussianStocks || RussianStocks.length === 0) {
        return "❌ Не удалось получить данные о российских акциях";
    }

    // Sort stocks by absolute price change percentage
    const sortedStocks = [...RussianStocks].sort((a, b) => 
        Math.abs(parseFloat(b.changePercent)) - Math.abs(parseFloat(a.changePercent))
    );

    // Take top 10 stocks
    const topStocks = sortedStocks.slice(0, 10);

    let message = "📊 <b>Топ-10 российских акций</b>\n\n";
    
    topStocks.forEach((stock, index) => {
        const changeEmoji = parseFloat(stock.changePercent) >= 0 ? "📈" : "📉";
        const changeSign = parseFloat(stock.changePercent) >= 0 ? "+" : "";
        
        message += `${index + 1}. <b>${stock.symbol}</b> - ${stock.name}\n`;
        message += `${changeEmoji} ${nFormat(stock.price)} ₽ (${changeSign}${nFormat(stock.changePercent)}%)\n`;
        message += `📊 Объем: ${nFormat(stock.volume)}\n`;
        message += `💰 Капитализация: ${nFormat(stock.marketCap)} ₽\n\n`;
    });

    message += `\n${timestampSlow}`;
    
    return message;
}; 