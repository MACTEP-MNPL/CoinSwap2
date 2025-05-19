import { getInvestingLastRate } from "../../db/rates.js"

export const getInvestingDollar = async () => {
  return (await getInvestingLastRate()).usd_rub
}

export const getInvestingEuro = async () => {
  return (await getInvestingLastRate()).eur_rub
}
