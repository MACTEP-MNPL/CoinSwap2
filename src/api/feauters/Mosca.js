import axios from 'axios'

export const getMoscaBuyDollar = async () => {
    try {
        const response = await axios.get('https://mosca.moscow/api/v1/rate/', {
            headers: {
            'access-token': 'Nee3oE-yRYTNBlrEn4UW9GAKewxkFBg_9CKit_bGd-XABjLdD-94BouD5vcjT3dmS6fv0xmgZ--rdUkXJ4qM5A'
            }
        })

        return response.data.sell
    } catch (error) {
        console.error('Error fetching Mosca buy dollar rate:', error)
    }
}

export const getMoscaSellDollar = async () => {
    try {
        const response = await axios.get('https://mosca.moscow/api/v1/rate/', {
            headers: {
                'access-token': 'Nee3oE-yRYTNBlrEn4UW9GAKewxkFBg_9CKit_bGd-XABjLdD-94BouD5vcjT3dmS6fv0xmgZ--rdUkXJ4qM5A'
            }
        })
        
        return response.data.buy
    } catch (error) {
        console.error('Error fetching Mosca sell dollar rate:', error)
    }
}
