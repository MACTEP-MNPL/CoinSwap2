import { Menu } from "@grammyjs/menu";
import { isUser1Lvl } from "../utils/userLvl.js";

export const manageAdminsMenu = new Menu("manageAdminsMenu")

manageAdminsMenu.text("Сделать админом (1 ур.)", async (ctx) => {
    if(await isUser1Lvl(ctx)) {
        return
    }

   await ctx.conversation.enter("make1lvlAdminConversation")

    
}).row()

manageAdminsMenu.text("Сделать админом (2 ур.)", async (ctx) => {
    if(await isUser1Lvl(ctx)) {
        return
    }

    await ctx.conversation.enter("make2lvlAdminConversation")
}).row()

manageAdminsMenu.text("Снять админку (1 ур.)", async (ctx) => {
    if(await isUser1Lvl(ctx)) {
        return
    }

    await ctx.conversation.enter("makeUserConversation")
})

