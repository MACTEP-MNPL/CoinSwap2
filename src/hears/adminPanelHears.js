import { Composer } from "grammy";
import {isUser2Lvl} from "../utils/userLvl.js"
import {adminPanelKeyboard} from "../keyboards/adminPanelKeyboard.js"
import { isPrivate } from "../utils/isPrivate.js"
export const adminPanelHears = new Composer()

adminPanelHears.hears("😎 Админ панель", async (ctx) => {
    if (!isPrivate(ctx)) {
        return
    }

    if(await isUser2Lvl(ctx)) {
        await ctx.reply("😎 Админ панель", {
            reply_markup: adminPanelKeyboard
        })
    }

})