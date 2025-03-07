import { Composer } from "grammy";

export const deleteAccountHears = new Composer()

deleteAccountHears.hears("🗑 Удалить аккаунт", async (ctx) => {
    await ctx.conversation.enter("deleteAccount")
})