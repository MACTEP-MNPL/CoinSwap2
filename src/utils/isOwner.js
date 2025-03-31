import { TG_OWNER_ID } from "../bot.js"

export const isOwner = async (ctx) => {
    return ctx.from.id === TG_OWNER_ID
}
