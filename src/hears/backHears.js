import { Composer } from "grammy";
import {getUserLvl} from "../utils/userLvl.js"
import {lvl1Keyboard} from "../keyboards/lvl1Keyboard.js"
import {lvl2Keyboard} from "../keyboards/lvl2Keyboard.js"
import { isUser2Lvl } from "../utils/userLvl.js";
import { isPrivate } from "../utils/isPrivate.js";
export const backHears = new Composer()

backHears.hears("⬅️ Назад", async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if (!await isUser2Lvl(ctx)) {
        return;
    }

    const userLvl = await getUserLvl(ctx)

    if (userLvl === 1) {   
        await ctx.reply("👮‍♂️ Вы админ первого уровня", {
            reply_markup: lvl1Keyboard
        })
    }

    if (userLvl === 2) {   
        await ctx.reply("👮‍♂️ Вы админ второго уровня", {
            reply_markup: lvl2Keyboard
        })
    }
})