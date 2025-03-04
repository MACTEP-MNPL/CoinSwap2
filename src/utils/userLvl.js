import {getUserLvlByTelegramId} from "../db/users.js"

export const getUserLvl = async (ctx) => {
    const userLvl = await getUserLvlByTelegramId(ctx.from.id)
    return userLvl
}

export const isUser0Lvl = async (ctx) => {
    const userLvl = await getUserLvl(ctx)
    return userLvl === 0
}

export const isUser1Lvl = async (ctx) => {
    const userLvl = await getUserLvl(ctx)
    return userLvl === 1
}

export const isUser2Lvl = async (ctx) => {
    const userLvl = await getUserLvl(ctx)
    return userLvl === 2
}

export const isAdmin = async (ctx) => {
    const userLvl = await getUserLvl(ctx)
    return userLvl >= 1
}

