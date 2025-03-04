import { isAdmin } from "../utils/userLvl.js"
import { Composer } from "grammy"
import { isPrivate } from "../utils/isPrivate.js"

export const ExHears = new Composer()

ExHears.hears('🌍 XE', async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if(await isAdmin(ctx)) {
        const message = '🌍 <b>XE</b> в разработке.\n\n <a href="https://www.xe.com">А пока можете посмотреть курсы в ручную.</a>'
        await ctx.reply(message, {parse_mode: 'HTML', disable_web_page_preview: true})
    }
})
