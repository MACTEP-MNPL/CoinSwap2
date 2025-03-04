import {db} from "../bot.js"

export const getUserLvlByTelegramId = async (telegramId) => {
    const [result] = await db.execute(
        'SELECT lvl FROM users WHERE id = ?',
        [telegramId]
    )
    
    return result[0].lvl
}

export const getAll1LvlAdmins = async () => {
    const [result] = await db.execute(
        'SELECT * FROM users WHERE lvl = 1'
    )
    
    return result
}

export const getAll2LvlAdmins = async () => {
    const [result] = await db.execute(
        'SELECT * FROM users WHERE lvl = 2'
    )
    
    return result
}

export const getUserByUsername = async (username) => {
    
    const [result] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    )
    
    return result[0]
}

export const make1lvlAdminByUsername = async (username) => {
    await db.execute(
        'UPDATE users SET lvl = 1 WHERE username = ?',
        [username]
    )
}

export const make2lvlAdminByUsername = async (username) => {
    await db.execute(
        'UPDATE users SET lvl = 2 WHERE username = ?',
        [username]
    )
}

export const removeAdminByUsername = async (username) => {
    await db.execute(
        'UPDATE users SET lvl = 0 WHERE username = ?',
        [username]
    )
}

