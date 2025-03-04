import { Composer } from "grammy";
import { Menu, MenuRange } from "@grammyjs/menu";
import { isUser2Lvl } from "../utils/userLvl.js";
import { getAllCities } from "../db/cities.js";
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
                        // Store the selected city in session
                        ctx.session.selectedCity = city.name;
                        
                        // Start the conversation to update margins
                        await ctx.conversation.enter("updateCityMarginConversation");
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