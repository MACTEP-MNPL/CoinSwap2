import { db } from "../bot.js"

export const getNewToken = async () => {
    while (true) {
        // Generate a random letter for the start and end
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const firstLetter = letters[Math.floor(Math.random() * letters.length)];
        const lastLetter = letters[Math.floor(Math.random() * letters.length)];
        
        // Generate 8 random digits
        const numbers = Math.floor(10000000 + Math.random() * 90000000).toString();
        
        // Combine into final token
        const token = `${firstLetter}${numbers}${lastLetter}`;
        
        try {
            // Check if token exists
            const [existingToken] = await db.execute(
                'SELECT token FROM tokens WHERE token = ?',
                [token]
            );

            // If token doesn't exist, insert it and return
            if (!existingToken.length) {
                await db.execute(
                    'INSERT INTO tokens (token) VALUES (?)',
                    [token]
                );
                
                return token;
            }
        } catch (error) {
            console.error('Error generating token:', error);
            throw error;
        }
    }
}