import axios from "axios";

export const getCBRFDollar = async () => {
    const response = (await axios.get("https://www.cbr-xml-daily.ru/daily_json.js")).data
    return response.Valute.USD.Value
}

export const getCBRFEuro = async () => {
    const response = (await axios.get("https://www.cbr-xml-daily.ru/daily_json.js")).data
    return response.Valute.EUR.Value
}