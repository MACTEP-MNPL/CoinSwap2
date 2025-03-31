import { Composer } from "grammy";
import * as math from 'mathjs';
import { api } from '../bot.js';

export const inlineMath = new Composer();

// Handle inline queries
inlineMath.on('inline_query', async (ctx) => {
    try {
        let query = ctx.inlineQuery.query.trim();
        
        // Replace keywords with their values
        query = query
            .replace(/абц/g, api.ABCEXBuyDollar)
            .replace(/abc/g, api.ABCEXBuyDollar)
            .replace(/,/g, '.');

        const result = math.evaluate(query);
        const formattedResult = typeof result === 'number' 
            ? result.toFixed(2)
            : result.toString();

        await ctx.answerInlineQuery([
            {
                type: 'article',
                id: '1',
                title: `${query} = ${formattedResult}`,
                description: 'Нажмите чтобы отправить результат',
                thumb_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsCoZu6S5y8tnaG_-ofjoBD2Uw9OwKRbZjPA&s', // Optional: Add a thumbnail
                thumb_width: 48,
                thumb_height: 48,
                input_message_content: {
                    message_text: `${query} = <code>${formattedResult}</code>`,
                    parse_mode: 'HTML'
                }
            }
        ], {
            input_field_placeholder: 'Введите математическое выражение'
        });
    } catch (error) {
        // If it's not a valid math expression, don't show any results
        return;
    }
});