require("dotenv").config();

const {
  createOfferAPI,
  getAvailableBalanceAPI,
  cancelAllFundingOffersAPI,
  handleResponse
} = require("./utils/api");
const getMaxRate = require("./utils/getMaxRate");

async function cleanOffers() {
  const symbol = process.env.SYMBOL;
  try {
    const response = await cancelAllFundingOffersAPI({
      currency: symbol.replace("f", "")
    });
    const { status, message } = handleResponse(response);
    console.log(status, message);
  } catch (err) {
    throw err;
  }
}

async function autoOffer() {
  const symbol = process.env.SYMBOL;
  const offer = process.env.EACH_OFFER;
  const keepMoney = process.env.KEEP_MONEY;
  const baseRate = process.env.BASE_RATE;
  const jumpRate = process.env.JUMP_RATE;

  console.log("=========================");

  console.log(`Symbol: ${symbol}`);
  console.log(`Keep money: ${keepMoney}`);
  console.log(`Base Rate: ${baseRate}`);
  console.log(`Jump Rate: ${jumpRate}`);
  console.log(`Offer: ${offer}`);

  console.log("=========================");

  try {
    const rate = await getMaxRate(symbol, 2);
    const expectedRate = baseRate / 100;

    console.log(`Rate: ${rate}`);
    console.log(`Expected: ${expectedRate}`);

    if (rate < expectedRate) {
      throw new Error("current rate rate is lower than expected rate");
    }
    console.log(`APY: ${(rate * 100 * 360).toFixed(6)}%`);

    const currentBalance = await getAvailableBalanceAPI(symbol);
    const balance = currentBalance[0] * -1;

    console.log(`Balance: ${balance}`);
    console.log(`Offer: ${offer}`);

    const restMoney = balance - keepMoney;
    const offerTimes = Math.floor(restMoney / offer);
    const lowOffer =
      restMoney % offer >= 50
        ? (restMoney % offer) - 0.000001 // balance must not become 0
        : 0;

    if (restMoney < 0 || (restMoney < 50 && restMoney < offer)) {
      throw new Error("balance is not enough");
    }

    let period = rate >= jumpRate ? 30 : 2;

    const promises = Array(offerTimes)
      .fill(1)
      .map(() => createOfferAPI({ symbol, offer, rate, per: period }));

    if (lowOffer > 0) {
      promises.push(
        createOfferAPI({ symbol, offer: lowOffer, rate, per: period })
      );
    }

    const trades = await Promise.all(promises);
    trades.map(trade => {
      const { status, message } = handleResponse(trade);
      console.log(status, message);
    });
  } catch (err) {
    throw err;
  }
}

const handler = async () => {
  try {
    await cleanOffers();
    await autoOffer();
  } catch (err) {
    console.log(err);
  }
};

if (process.env.NODE_ENV === "development") {
  handler();
}

exports.handler = handler;
