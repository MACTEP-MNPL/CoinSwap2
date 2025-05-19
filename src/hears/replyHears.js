export const handleBotReply = async (ctx) => {
    try {
        // Get the text of the original bot message that the user is replying to
        const originalBotMessage = ctx.message.reply_to_message.text || '';
        // Get the user's reply text
        const userReply = ctx.message.text;

        // If the original message contained certain keywords, handle accordingly
        if (originalBotMessage.includes('код') || originalBotMessage.includes('CODE')) {
            await ctx.reply('Проверяю код...');
            return true;
        } 
        else if (originalBotMessage.includes('тикет') || originalBotMessage.includes('ticket')) {
            await ctx.reply('Обрабатываю информацию по тикету...');
            return true;
        }
        else if (originalBotMessage.includes('курс') || originalBotMessage.includes('rate')) {
            await ctx.reply('Получаю актуальный курс...');
            return true;
        }
        else if (originalBotMessage.includes('баланс') || originalBotMessage.includes('balance')) {
            await ctx.reply('Проверяю баланс...');
            return true;
        }
        
        // Default response if we couldn't categorize the reply
        await ctx.reply('Я получил ваше сообщение. Чем могу помочь?');
        return true;
    } catch (error) {
        console.error('Error handling bot reply:', error);
        return false;
    }
}; 