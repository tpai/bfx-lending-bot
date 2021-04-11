import { config } from "dotenv";
config();

import "./utils/polyfill";
import {
  getAvailableBalanceAPI,
  cancelAllFundingOffersAPI,
  handleResponse,
  SimpleResponse,
  createOfferAPI
} from "./utils/api";
import { OFFER_SYMBOL } from "./constants/offer";
import getMaxRate from "./utils/getMaxRate";

async function cleanOffers() {
  const { SYMBOL = OFFER_SYMBOL.USD } = process.env;
  const symbol: OFFER_SYMBOL = SYMBOL.split(",")[0] as OFFER_SYMBOL;
  try {
    const response = await cancelAllFundingOffersAPI(symbol);
    const { status, message }: SimpleResponse = handleResponse(response);
    console.log(status, message);
  } catch (err) {
    throw err;
  }
}

async function autoOffer() {
  const {
    SYMBOL = OFFER_SYMBOL.USD,
    KEEP_MONEY = "0",
    BASE_RATE = "0.03",
    JUMP_RATE = "0.06",
    EACH_OFFER = "500",
  } = process.env;

  const symbol: OFFER_SYMBOL = SYMBOL.split(",")[0] as OFFER_SYMBOL;
  const keepMoney: number = +KEEP_MONEY.split(",")[0];
  const baseRate: number = +BASE_RATE.split(",")[0];
  const jumpRate: number = +JUMP_RATE.split(",")[0] / 100;
  const offer: number = +EACH_OFFER.split(",")[0];

  console.log("=========================");

  console.log(`Symbol: ${symbol}`);
  console.log(`Keep money: ${keepMoney}`);
  console.log(`Base Rate: ${baseRate}`);
  console.log(`Jump Rate: ${jumpRate}`);
  console.log(`Offer: ${offer}`);

  console.log("=========================");

  try {
    const rate = await getMaxRate(symbol, 2);
    const expectedRate = +(baseRate / 100).toFlooredFixed(6);

    console.log(`Rate: ${rate}`);
    console.log(`Expected: ${expectedRate}`);

    if (rate < expectedRate) {
      throw new Error("current rate is lower than expected rate");
    }
    console.log(`APY: ${(rate * 100 * 360).toFixed(6)}%`);

    const currentBalance = await getAvailableBalanceAPI(symbol);
    const balance = currentBalance[0] * -1;

    console.log(`Balance: ${Number(balance).noExponents()}`);
    console.log(`Offer: ${offer}`);

    const restMoney = balance - keepMoney;
    const offerTimes = Math.floor(restMoney / offer);
    const lowOffer =
      restMoney % offer >= 50 // minimum offer is $50
        ? (restMoney % offer) - 0.000001 // balance must not become 0
        : 0;

    console.log(`Low Offer: ${lowOffer}`);

    if (restMoney < 0 || (restMoney < 50 && restMoney < offer)) {
      throw new Error("balance is not enough");
    }

    let period = rate >= jumpRate ? 120 : 2;

    const promises = Array(offerTimes)
      .fill(1)
      .map(() => createOfferAPI(symbol, { offer, rate, per: period }));

    if (lowOffer > 0) {
      promises.push(
        createOfferAPI(symbol, { offer: lowOffer, rate, per: period })
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
