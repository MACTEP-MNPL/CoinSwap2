import { isAdmin } from "../utils/userLvl.js"
import { Composer } from "grammy"
import { isPrivate } from "../utils/isPrivate.js"
import { getXERatesMessage } from "../messages/getXERatesMessage.js"

export const ExHears = new Composer()

ExHears.hears('🌍 XE', async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if(await isAdmin(ctx)) {
        const message = await getXERatesMessage(ctx)
        await ctx.reply(message, {parse_mode: 'HTML', disable_web_page_preview: true})
    }
})
