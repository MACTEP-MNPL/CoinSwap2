import { getUserByUsername, make1lvlAdminByUsername, make2lvlAdminByUsername, removeAdminByUsername } from "../db/users.js"
import { adminPanelKeyboard } from "../keyboards/adminPanelKeyboard.js";


export const make1lvlAdminConversation  = async (conversation, ctx) => {
    await ctx.reply("Введите @username пользователя которого хотите сделать администратором 1 уровня:")

    let username = (await conversation.waitFor("message:text")).message.text;

    if (username.startsWith('@')) {
        username = username.slice(1);
    }

    const user = await getUserByUsername(username)

    if(!user) {
        await ctx.reply("Пользователь с таким @username не существует. Нужно хотя бы раз воспользоваться ботом, чтобы попасть в базу данных.")
        return
    }

    await make1lvlAdminByUsername(username)

    await ctx.reply(`Пользователь @${username} успешно стал администратором 1 уровня`,
        {
            reply_markup: adminPanelKeyboard
        }
    )
}


export const make2lvlAdminConversation  = async (conversation, ctx) => {
    await ctx.reply("Введите @username пользователя которого хотите сделать администратором 2 уровня:")


    let username = (await conversation.waitFor("message:text")).message.text;

    if (username.startsWith('@')) {
        username = username.slice(1);
    }

    const user = await getUserByUsername(username)

    if(!user) {
        await ctx.reply("Пользователь с таким @username не существует. Нужно хотя бы раз воспользоваться ботом, чтобы попасть в базу данных.")
        return
    }

    await make2lvlAdminByUsername(username)

    await ctx.reply(`Пользователь @${username} успешно стал администратором 2 уровня`,
        {
            reply_markup: adminPanelKeyboard
        }
    )
}

export const makeUserConversation  = async (conversation, ctx) => {
    await ctx.reply("Введите @username пользователя которого хотите удалить из администраторов:")

    let username = (await conversation.waitFor("message:text")).message.text;

    if (username.startsWith('@')) {
        username = username.slice(1);
    }

    const user = await getUserByUsername(username)

    if(!user) {
        await ctx.reply("Пользователь с таким @username не существует. Нужно хотя бы раз воспользоваться ботом, чтобы попасть в базу данных.")
        return
    }

    if(user.lvl === 2) {
        await ctx.reply("Вы не можете снимать администраторов 2 уровня")
        return
    }

    await removeAdminByUsername(username)

    await ctx.reply(`Пользователь @${username} успешно удален из администраторов и теперь является обычным пользователем`,
        {
            reply_markup: adminPanelKeyboard
        }
    )
}   
