import { Composer } from "grammy";
import { getAll1LvlAdmins, getAll2LvlAdmins } from "../db/users.js";
import { manageAdminsMenu } from "../menus/manageAdminsMenus.js";
import { isUser2Lvl } from "../utils/userLvl.js";
import { isPrivate } from "../utils/isPrivate.js";

export const adminsHears = new Composer()

adminsHears.hears("👮‍♂️ Админы", async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if (!await isUser2Lvl(ctx)) {
        return;
    }

    const all1LvlAdmins = await getAll1LvlAdmins()
    const all2LvlAdmins = await getAll2LvlAdmins()

    await ctx.reply(
        '<b>Все админы:</b> \n\n' +
        '<blockquote>1 уровень</blockquote>' +
        (all1LvlAdmins.length > 0 ? all1LvlAdmins.map(admin => `‣ @${admin.username}`).join('\n') : '‣ Нет админов') +
        '\n\n<blockquote>2 уровень</blockquote>' +
        (all2LvlAdmins.length > 0 ? all2LvlAdmins.map(admin => `‣ @${admin.username}`).join('\n') : '‣ Нет админов'),
    {
        parse_mode: "HTML",
        reply_markup: manageAdminsMenu
    })
})