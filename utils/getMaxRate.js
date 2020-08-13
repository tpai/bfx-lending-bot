require("dotenv").config();

const { getTradesAPI } = require("./api");

module.exports = async function(symbol, period) {
  try {
    const trades = await getTradesAPI(symbol);
    const map = new Map();
    trades.reduce((result, [, , amount, rate, per]) => {
      if (period === per && amount < 0 && !result.has(rate)) {
        result.set(rate, 1);
      }
      return result;
    }, map);
    let max = Number(process.env.BASE_RATE) / 100;
    Array.from(map).map(([rate, _]) => {
      if (rate > max) {
        max = rate;
      }
    });
    return max.toFixed(8);
  } catch (err) {
    throw err;
  }
};
