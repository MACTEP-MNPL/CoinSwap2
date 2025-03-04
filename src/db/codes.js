import { db } from "../bot.js"

export const getNewCode = async () => {
    while (true) {
        // Generate a random 6-digit number
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        try {
            // Check if code exists
            const [existingCode] = await db.execute(
                'SELECT code FROM codes WHERE code = ?',
                [code]
            );

            // If code doesn't exist, insert it and return formatted version
            if (!existingCode.length) {
                await db.execute(
                    'INSERT INTO codes (code) VALUES (?)',
                    [code]
                );
                
                // Return formatted code with hyphen
                return `${code.slice(0, 3)}-${code.slice(3)}`;
            }
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    }
}
