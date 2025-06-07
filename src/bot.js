import dotenv from 'dotenv'
import {Bot, session} from "grammy"
import {GrammyError, HttpError} from "grammy"
import {pool} from "./db/db.js"
import {conversations} from "@grammyjs/conversations"
import {commands} from "./commands/commands.js"
import {hears} from "./hears/hears.js"
import { menus } from './menus/menus.js'
import { convers } from './conversations/convers.js'
import { createApi } from './api/createApi.js'
import { hydrate } from '@grammyjs/hydrate'
import { inlineMath } from './hears/mathHears.js'
import { isAdmin } from './utils/userLvl.js'
import { handleBotReply } from './hears/replyHears.js'
import { topUpBalanceHears } from './hears/topUpBalanceHears.js'

dotenv.config()

const {TG_BOT_TOKEN, TG_CHANNEL_ID, TG_CHANNEL_USERNAME} = process.env

export const {PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD, TG_OWNER_ID} = process.env

export const db = await pool.getConnection()
export const api = new createApi()

try {
    await api.updateFast()
    await api.updateSlow()
    
} catch (error) {
    console.error('Error updating API:', error)
}

export const bot = new Bot(TG_BOT_TOKEN)

bot.use(hydrate())

bot.use(session({
    initial() {
      return {
        undos: {},
        selectedCity: null
      };
    },
}));

bot.use(conversations());

// Define command lists
const regularCommands = [
    { command: "start", description: "Запустить бота" },
];

const adminCommands = [
    { command: "start", description: "Запустить бота" },
    { command: "help", description: "Список команд" },
    { command: "summ", description: "Выписка по аккаунту" },
    { command: "abc", description: "Курс ABCEX" },
    { command: "city", description: "Курс в городах" },
    { command: "admin", description: "Админ панель" },
    { command: "ticket", description: "Создать тикет" },
    { command: "code", description: "Создать код" },
    { command: "token", description: "Создать токен" },
    { command: "usdt_ex", description: "Курс USDT" },
    { command: "forex", description: "Курс forex" },
    { command: "city", description: "Курс в городах" },
    { command: "xe", description: "Кросс-курс валют" },
    { command: "msc", description: "Курс в Москве" },
    { command: "mcx", description: "Курс в Махачкале" },
];

// Function to set commands based on user level
async function setUserCommands(ctx, isAdmin) {
    try {
        if (isAdmin) {
            // Set admin commands for this specific user
            await ctx.api.setMyCommands(adminCommands, {
                scope: { type: "chat", chat_id: ctx.chat.id }
            });
        } else {
            // Set regular commands for this specific user
            await ctx.api.setMyCommands(regularCommands, {
                scope: { type: "chat", chat_id: ctx.chat.id }
            });
        }
    } catch (error) {
        console.error('Error setuting commands:', error);
    }
}

bot.use(async (ctx, next) => {
    try {
        console.log(ctx.chat?.type)
        if (ctx.chat?.type !== 'private') {
            return await next();
        }
        
            const adminCheck = await isAdmin(ctx);
            await setUserCommands(ctx, adminCheck);

        return await next();
    } catch (error) {
        console.error('Middleware error:', error);
        return await next();
    }
});

bot.use(async (ctx, next) => {
   try {

       if (!ctx.from) return next()

       const [existingUsers] = await db.execute(
           'SELECT * FROM users WHERE id = ?',
           [ctx.from.id]
       )

       if (existingUsers && existingUsers.length > 0) {
         if(existingUsers[0].username !== ctx.from.username) {
            
           let username = ctx.from.username

           if(!username) {
             username = 'Нет юзернейма'
           }

           await db.execute(
               'UPDATE users SET username = ? WHERE id = ?',
               [username, ctx.from.id]
           )
          }

          if (existingUsers[0].is_banned) {
                return
          }
        } else {
            await db.execute(
                'INSERT INTO users (id, username, is_banned, lvl) VALUES (?, ?, FALSE, 0)',
                [ctx.from.id, ctx.from.username || null]
            )
        }

        return next()
    } catch (error) {
        console.error('Error in middleware:', error)
        return next()
}
})

bot.use(async (ctx, next) => {
    try {

      if (ctx.chat?.type !== 'private') {
        return await next();
    }
        const channelId = TG_CHANNEL_ID;
        const userId = ctx.from?.id;

        if (!userId) {
            return await next();
        }

        const member = await ctx.api.getChatMember(channelId, userId);
        
        // List of allowed status types for channel members
        const allowedStatus = ['creator', 'administrator', 'member'];
        
        if (!allowedStatus.includes(member.status)) {
            await ctx.reply(
                `👋 Для использования бота необходимо подписаться на наш телеграм канал: @${TG_CHANNEL_USERNAME}\n\n`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '✅ Ссылка на канал', url: `https://t.me/${TG_CHANNEL_USERNAME}` }
                        ]]
                    }
                }
            );
            return;
        }

        return await next();
    } catch (error) {
        console.error('Subscription check error:', error);
        return await next();
    }
});

// Add a middleware to delete user commands after processing
bot.use(async (ctx, next) => {
    // Only proceed if this is a message with text starting with /
    if (!ctx.message?.text?.startsWith('/')) {
        return next();
    }
    
    // Extract the command name without parameters but preserve any bot username
    const fullCommand = ctx.message.text.split(' ')[0]; // Get the first word with potential @username
    
    // Also extract just the base command for matching against our list
    const baseCommand = fullCommand.split('@')[0].substring(1); // Remove the "/" and any bot username
    
    // Check if it's in our official command lists
    const isOfficialCommand = regularCommands.some(cmd => cmd.command === baseCommand) ||
                             adminCommands.some(cmd => cmd.command === baseCommand);
    
    // If it's not an official command, don't delete it
    if (!isOfficialCommand) {
        return next();
    }
    
    // Store the message ID before processing
    const messageId = ctx.message.message_id;
    const chatId = ctx.chat.id;
    
    // Process the command/message
    await next();
    
    // After processing, delete the user's message
    if (messageId && chatId) {
        try {
            // Wait a short delay to make sure the bot's response is sent first
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessage(chatId, messageId);
                    console.log(`Deleted official command ${fullCommand} (${messageId}) in chat ${chatId}`);
                } catch (deleteErr) {
                    console.error(`Error deleting command ${fullCommand}:`, deleteErr);
                }
            }, 1000); // 1 second delay for more reliable deletion
        } catch (error) {
            console.error('Error in message deletion middleware:', error);
        }
    }
});


bot.use(convers)

bot.use(menus)

bot.use(commands)

bot.use(hears)

bot.use(inlineMath)

// Handle replies to bot messages
bot.use(async (ctx, next) => {
    try {
        // Check if this is a reply to the bot's message
        if (ctx.message?.reply_to_message?.from?.id === ctx.me.id) {
            // Message is a reply to the bot
            const text = ctx.message.text;
            
            if (text && !text.startsWith('/')) {
                // Handle reply without command prefix using our handler
                const handled = await handleBotReply(ctx);
                if (handled) return; // Stop processing if handled
            }
        }
        
        // Continue to next middleware for normal commands
        return next();
    } catch (error) {
        console.error('Error in reply handling middleware:', error);
        return next();
    }
});


bot.on("chat_member", async (ctx) => {
    try {
        const update = ctx.update.chat_member;
        
        // Check if this is for our channel
        if (update.chat.username !== TG_CHANNEL_USERNAME) {
            return;
        }

        // Check if this is a new join
        if (update.old_chat_member.status !== 'member' && 
            update.new_chat_member.status === 'member') {
            
            // Send welcome message to the user
            await bot.api.sendMessage(
                update.new_chat_member.user.id,
                `🤝 Спасибо за подписку на канал @${TG_CHANNEL_USERNAME}!\n\n` +
                `Теперь вы можете использовать все функции бота.\n` +
                `Нажмите /start чтобы начать.`,
                {
                    parse_mode: 'HTML'
                }
            );
        }
    } catch (error) {
        console.error('Error handling chat member update:', error);
    }
});

bot.use(topUpBalanceHears)

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
});

bot.start({
    allowed_updates: [
        "message",
        "chat_member",  // This is important for join notifications
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "business_connection",
        "business_message",
        "edited_business_message",
        "deleted_business_messages",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_join_request",
        "chat_boost",
        "removed_chat_boost"
    ]
})

// Add this function to handle reconnection
const handleDisconnect = async () => {
  try {
    await pool.getConnection();
    console.log('Reconnected to database');
  } catch (error) {
    console.error('Error reconnecting to database:', error);
    setTimeout(handleDisconnect, 2000); // Try to reconnect every 2 seconds
  }
};

// Add error handling for database connection
pool.on('error', async (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    handleDisconnect();
  } else {
    throw err;
  }
});




