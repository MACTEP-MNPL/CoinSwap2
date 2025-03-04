import { Composer } from 'grammy'
import { manageTarifsMenu } from '../menus/manageTarifsMenu.js'
import { isAdmin } from '../utils/userLvl.js'
import { isPrivate } from '../utils/isPrivate.js'

export const tarifsHears = new Composer()

tarifsHears.hears('📊 Тарифы', async (ctx) => {

    if (!isPrivate(ctx)) {
        return
    }

    if (!await isAdmin(ctx)) {
        return;
    }

    await ctx.reply('📊 Тарифы', { reply_markup: manageTarifsMenu })
})
