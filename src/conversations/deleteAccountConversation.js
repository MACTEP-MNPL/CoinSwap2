import { deleteAccountById } from "../db/accounts.js";
import { isUser2Lvl } from "../utils/userLvl.js";
import { getAccountById } from "../db/accounts.js";

export const deleteAccount = async (conversation, ctx) => {
    if(!isUser2Lvl(ctx)) return
    try {
        await ctx.reply("Введите ID аккаунта который хотите удалить, ID всех аккаунтов находятся в глобальной сводке")

    const { message } = await conversation.waitFor("message:text")

    if(!message.text) return

    const id = message.text

    const account = await getAccountById(id)

    if(!account) return await ctx.reply("Аккаунта с таким ID не существует")

    await conversation.external(async () => {
        await deleteAccountById(id)
    })
        await ctx.reply("Аккаунт удален")
    } catch (error) {
        await ctx.reply("Произошла ошибка, попробуйте снова")
    }
}