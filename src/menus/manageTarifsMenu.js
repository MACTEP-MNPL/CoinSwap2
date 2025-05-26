import { Menu, MenuRange } from "@grammyjs/menu";
import { isUser2Lvl } from "../utils/userLvl.js";
import { getAllCities, getCityById, updateCityBuyMargin, updateCitySellMargin } from "../db/cities.js";
import { nFormat } from "../utils/n.js";

export const manageTarifsMenu = new Menu("tarifs-menu")
    .dynamic(async (ctx) => {

        if (!await isUser2Lvl(ctx)) {
            return new Menu("tarifs-menu-empty");
        }

        const menu = new MenuRange();
        
        try {
            // Get all active cities
            const cities = await getAllCities();
            
            // Add a button for each city
            cities.forEach((city, index) => {
                menu.text(
                    `${city.name} ${nFormat(city.buy_margin)}% | ${nFormat(city.sell_margin)}%`,
                    async (ctx) => {
                        // Create a submenu for this specific city
                        const cityId = city.id;
                        const cityName = city.name;
                        
                        // Store the city ID in the session for later use
                        ctx.session.selectedCityId = cityId;
                        
                        // Create and send a new menu for editing margins
                        await ctx.reply(
                            `Управление тарифами для города: ${cityName}\n` +
                            `Текущие значения:\n` +
                            `Покупка: ${nFormat(city.buy_margin)}%\n` +
                            `Продажа: ${nFormat(city.sell_margin)}%`,
                            { reply_markup: cityTarifMenu }
                        );
                    }
                ).row()
                
            });
                  
            return menu;
        } catch (error) {
            console.error("Error loading cities for menu:", error);
            return new Menu("tarifs-menu-error").text("❌ Ошибка загрузки", async (ctx) => {
                await ctx.reply("Произошла ошибка при загрузке городов.");
            });
        }
    });

// Create a menu for editing city tarifs
export const cityTarifMenu = new Menu("city-tarif-menu")
    .text("↑ Покупка +0.05%", async (ctx) => {
        try {
            const cityId = ctx.session.selectedCityId;
            // Implement function to update buy margin by +0.05%
            await updateCityBuyMargin(cityId, 0.05);
            const updatedCity = await getCityById(cityId);
            
            await ctx.reply(
                `Маржа покупки обновлена: ${nFormat(updatedCity.buy_margin)}%`
            );
        } catch (error) {
            console.error("Error updating buy margin:", error);
            await ctx.reply("Произошла ошибка при обновлении маржи покупки.");
        }
    })
    .text("↓ Покупка -0.05%", async (ctx) => {
        try {
            const cityId = ctx.session.selectedCityId;
            // Implement function to update buy margin by -0.05%
            await updateCityBuyMargin(cityId, -0.05);
            const updatedCity = await getCityById(cityId);
            
            await ctx.reply(
                `Маржа покупки обновлена: ${nFormat(updatedCity.buy_margin)}%`
            );
        } catch (error) {
            console.error("Error updating buy margin:", error);
            await ctx.reply("Произошла ошибка при обновлении маржи покупки.");
        }
    })
    .row()
    .text("↑ Продажа +0.05%", async (ctx) => {
        try {
            const cityId = ctx.session.selectedCityId;
            // Implement function to update sell margin by +0.05%
            await updateCitySellMargin(cityId, 0.05);
            const updatedCity = await getCityById(cityId);
            
            await ctx.reply(
                `Маржа продажи обновлена: ${nFormat(updatedCity.sell_margin)}%`
            );
        } catch (error) {
            console.error("Error updating sell margin:", error);
            await ctx.reply("Произошла ошибка при обновлении маржи продажи.");
        }
    })
    .text("↓ Продажа -0.05%", async (ctx) => {
        try {
            const cityId = ctx.session.selectedCityId;
            // Implement function to update sell margin by -0.05%
            await updateCitySellMargin(cityId, -0.05);
            const updatedCity = await getCityById(cityId);
            
            await ctx.reply(
                `Маржа продажи обновлена: ${nFormat(updatedCity.sell_margin)}%`
            );
        } catch (error) {
            console.error("Error updating sell margin:", error);
            await ctx.reply("Произошла ошибка при обновлении маржи продажи.");
        }
    })
    .row()
    .text("✏️ Ввести маржу вручную", async (ctx) => {
        try {
            const cityId = ctx.session.selectedCityId;
            const city = await getCityById(cityId);
            
            // Store the city name for the conversation
            ctx.session.selectedCity = city.name;
            
            // Enter the conversation for manually updating margins
            await ctx.conversation.enter("updateCityMarginConversation");
        } catch (error) {
            console.error("Error entering margin conversation:", error);
            await ctx.reply("Произошла ошибка при попытке изменить маржу вручную.");
        }
    })
    .row()