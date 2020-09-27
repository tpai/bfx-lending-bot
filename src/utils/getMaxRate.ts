require("dotenv").config();

import { getTradesAPI } from "./api";
import { OFFER_SYMBOL } from "../constants/offer";

async function getMaxRate(symbol: OFFER_SYMBOL, period: number): Promise<number> {
  try {
    const trades = await getTradesAPI(symbol);
    const map = new Map();
    trades.reduce((result: Map<string, number>, [, , , rate, per]) => {
      if (period === per && !result.has(rate)) {
        result.set(rate, 1);
      }
      return result;
    }, map);
    let max = 0;
    Array.from(map).map(([rate, _]) => {
      if (rate > max) {
        max = rate;
      }
    });
    return +max.toFixed(8);
  } catch (err) {
    throw err;
  }
}

export default getMaxRate;
