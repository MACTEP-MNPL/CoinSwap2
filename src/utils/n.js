export const n = (number) => {
    return Number(number).toFixed(2);
}


export const n5 = (number) => {
    return (Math.round(number * 20) / 20).toFixed(2);
}


export const nCode = (number) => {
    return `<code>${n(number)}</code>`;
}


export const nCode5 = (number) => {
    return `<code>${n5(number)}</code>`;
}


export const nFormat = (number) => {

    if(number === undefined || number === null || isNaN(number) || number === Infinity || number === "NaN" || number === "Infinity" || number === "undefined" || number === "null" || number === '-') return "-"

    // Convert to fixed 2 decimal places first
    const fixed = Number(number).toFixed(2);
    
    // Remove .00 if present
    const withoutZeros = fixed.replace(/\.00$/, '');
    
    // Add thousands separator
    return withoutZeros.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const nForm = (number) => {

    if(number === undefined || number === null || isNaN(number) || number === Infinity || number === "NaN" || number === "Infinity" || number === "undefined" || number === "null" || number === '-') return "-"
    
    const fixed = Number(number).toFixed(0);
    
    // Remove .00 if present
    const withoutZeros = fixed.replace(/\.00$/, '');
    
    // Add thousands separator
    return withoutZeros.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

