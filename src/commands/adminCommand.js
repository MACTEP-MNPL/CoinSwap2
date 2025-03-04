import {getUserLvl} from "../utils/userLvl.js"
import {lvl1Keyboard} from "../keyboards/lvl1Keyboard.js"
import {lvl2Keyboard} from "../keyboards/lvl2Keyboard.js"
import {Composer} from "grammy"
import { isPrivate } from "../utils/isPrivate.js"

export const adminCommand = new Composer()

adminCommand.command("admin", async (ctx) => {

    if (!isPrivate(ctx)) {
        return
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
