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

dotenv.config()

const {TG_BOT_TOKEN} = process.env

export const {PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD} = process.env

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

bot.use(convers)

bot.use(menus)

bot.use(commands)

bot.use(hears)

bot.use(inlineMath)

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


bot.start({ allowed_updates: ['chat_member',"message",
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
  "removed_chat_boost"]
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




