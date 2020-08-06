const { getTradesAPI } = require("./api");

module.exports = async function(symbol, period) {
  const trades = await getTradesAPI(symbol);
  const map = new Map();
  trades.reduce((result, [, , amount, rate, per]) => {
    if (period === per && amount < 0 && !result.has(rate)) {
      result.set(rate, 1);
    }
    return result;
  }, map);
  const rates = Array.from(map).map(([rate, _]) => rate);
  const sum = rates.reduce((sum, n) => (sum += n), 0);
  return (sum / rates.length).toFixed(8);
};
