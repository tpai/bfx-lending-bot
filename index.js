require("dotenv").config();

const {
  createOfferAPI,
  getAvailableBalanceAPI,
  cancelAllFundingOffersAPI
} = require("./utils/api");
const getAvgRate = require("./utils/getAvgRate");

const symbol = process.env.SYMBOL;
const offer = process.env.EACH_OFFER;
const keepMoney = process.env.KEEP_MONEY;
const baseRate = process.env.BASE_RATE;

console.log("=========================");

console.log(`Symbol: ${symbol}`);
console.log(`Keep money: ${keepMoney}`);
console.log(`Base Rate: ${baseRate}`);
console.log(`Offer: ${offer}`);

console.log("=========================");

async function cleanOffers() {
  const [, , , , , , status, text] = await cancelAllFundingOffersAPI({
    currency: symbol.replace("f", "")
  });
  console.log(status, text);
}

async function autoOffer() {
  const avg = await getAvgRate(symbol, 2);
  const expectedRate = baseRate / 100;

  console.log(`Avg: ${avg}`);
  console.log(`Expected: ${expectedRate}`);

  if (avg < expectedRate) {
    console.log("> current avg rate is lower than expected rate");
    return;
  }
  console.log(`APY: ${(avg * 100 * 360).toFixed(6)}%`);

  const currentBalance = await getAvailableBalanceAPI(symbol);
  const balance = currentBalance[0] * -1;
  const nextBalance = balance - offer;

  console.log(`Balance: ${balance}`);
  console.log(`Offer: ${offer}`);

  if (Number(nextBalance) < Number(keepMoney)) {
    console.log(`> balance is not enough for this trade`);
    return;
  }

  let newOffer;
  if (Number(nextBalance) === Number(keepMoney)) {
    newOffer = offer - 0.00001;
  }

  const [, , , , , , status, text] = await createOfferAPI({
    symbol,
    offer: newOffer ? newOffer : offer,
    avg,
    per: 2
  });
  console.log(status, text);
  return autoOffer();
}

const handler = async () => {
  await cleanOffers();
  await autoOffer();
};

if (process.env.NODE_ENV === "development") {
  handler();
}

exports.handler = handler;
