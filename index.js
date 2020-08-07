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

  if (Number(balance) === 0) {
    console.log("> balance is not enough");
    return;
  }

  console.log(`Balance: ${balance}`);
  console.log(`Offer: ${offer}`);

  let finalOffer;
  if (Number(nextBalance) < Number(keepMoney)) {
    if (Number(keepMoney) < 0) {
      console.log("> keepMoney setting is invalid");
      return;
    } else if (Number(keepMoney) > 0) {
      console.log(`> balance is not enough for this trade`);
      return;
    }

    // offer the rest balance when user set keepMoney to 0
    finalOffer = balance;

    if (Number(finalOffer) < 50) {
      console.log(`Final Offer: ${finalOffer}`);
      console.log("> final offer is less than $50");
      return;
    }

    // in order to prevent balance become complete 0
    finalOffer -= 0.000001;

    console.log(`Final Offer: ${finalOffer}`);
  }

  const result = await createOfferAPI({
    symbol,
    offer: finalOffer ? finalOffer : offer,
    avg,
    per: 2
  });

  // got an error
  if (result.length <= 3) {
    const [status, , message] = result;
    console.log(status, message);
    return;
  }

  const [, , , , , , status, message] = result;
  console.log(status, message);
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
