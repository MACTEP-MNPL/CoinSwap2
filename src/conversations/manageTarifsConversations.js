import { getCityByName, updateCityMargin } from "../db/cities.js";
import { isUser2Lvl } from "../utils/userLvl.js";
import { nFormat } from "../utils/n.js";

export const updateCityMarginConversation = async (conversation, ctx) => {
    
    if (!await isUser2Lvl(ctx)) {
        return;
    }

    const cityName = await conversation.external((ctx) => ctx.session.selectedCity)
    
    if (!cityName) {
        await ctx.reply("❌ Город не выбран. Пожалуйста, выберите город из меню.");
        return;
    }

    const city = await getCityByName(cityName);
    
    if (!city) {
        await ctx.reply(`❌ Город "${cityName}" не найден.`);
        return;
    }

    await ctx.reply(
        `🏙️ <b>${cityName}</b>\n\n` +
        `Текущая маржа покупки: <b>${nFormat(city.buy_margin)}</b> %\n` +
        `Текущая маржа продажи: <b>${nFormat(city.sell_margin)}</b> %\n\n` +
        `Какую маржу вы хотите изменить? Введите команду и новое значение:\n` +
        `<code>покупка 10</code> - изменит маржу покупки на 10%\n` +
        `<code>продажа 5</code> - изменит маржу продажи на 5%`,
        { parse_mode: "HTML" }
    );

    const response = await conversation.waitFor("message:text");
    const inputText = response.message.text.toLowerCase();
    
    // Split the input into command and value
    const parts = inputText.split(/\s+/);
    
    if (parts.length < 2) {
        await ctx.reply("❌ Неверный формат. Пожалуйста, введите команду и значение, например: 'покупка 10'");
        return;
    }
    
    const command = parts[0];
    const valueText = parts[1];
    
    let marginType;
    let marginTypeRussian;
    
    if (command === "покупка") {
        marginType = "buy_margin";
        marginTypeRussian = "покупки";
    } else if (command === "продажа") {
        marginType = "sell_margin";
        marginTypeRussian = "продажи";
    } else {
        await ctx.reply("❌ Неверная команда. Пожалуйста, используйте 'покупка' или 'продажа'.");
        return;
    }
    
    // Validate new margin value
    let newMargin;
    try {
        newMargin = parseFloat(valueText.replace(',', '.'));
        
        if (isNaN(newMargin)) {
            throw new Error("Invalid margin value");
        }
        
        // Format to 2 decimal places
        newMargin = parseFloat(newMargin.toFixed(2));
    } catch (error) {
        await ctx.reply("❌ Неверное значение.");
        return;
    }

    // Update margin in database
    try {
        const updatedCity = await updateCityMargin(cityName, marginType, newMargin);
        
        await ctx.reply(
            `✅ Маржа ${marginTypeRussian} для города ${cityName} успешно обновлена!\n\n` +
            `Новая маржа ${marginTypeRussian}: <b>${nFormat(updatedCity[marginType])}</b> %`,
            { parse_mode: "HTML" }
        );
    } catch (error) {
        console.error("Error updating city margin:", error);
        await ctx.reply("❌ Произошла ошибка при обновлении маржи. Пожалуйста, попробуйте еще раз.");
    }
}; 