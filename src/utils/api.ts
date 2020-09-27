import fetch from "node-fetch";
import { stringify } from "query-string";

import getAuthHeaders from "./getAuthHeaders";
import { OFFER_SYMBOL } from "../constants/offer";

const host = "https://api.bitfinex.com/";
const pubHost = "https://api-pub.bitfinex.com/";

export async function getTradesAPI(
  symbol: OFFER_SYMBOL = OFFER_SYMBOL.USD,
  { limit = 30, sort = -1 } = {}
) {
  try {
    const url = `${pubHost}v2/trades/${symbol}/hist?${stringify({
      limit,
      sort
    })}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json instanceof Array) {
      return json;
    }
    throw new Error("get trades api error");
  } catch (err) {
    throw new Error("get trades api error");
  }
}

export async function createOfferAPI(
  symbol: OFFER_SYMBOL = OFFER_SYMBOL.USD,
  { offer, rate, per }: { offer: number; rate: number; per: number }
) {
  try {
    const body = {
      type: "LIMIT",
      symbol,
      amount: offer.toFixed(6),
      rate: rate.toFixed(6),
      period: per
    };
    const apiPath = "v2/auth/w/funding/offer/submit";
    const url = `${host}${apiPath}`;
    const headers = getAuthHeaders(apiPath, body);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    return json;
  } catch (err) {
    throw new Error("create offer api error");
  }
}

export async function getAvailableBalanceAPI(symbol: OFFER_SYMBOL = OFFER_SYMBOL.USD) {
  try {
    const body = {
      symbol,
      type: "FUNDING"
    };
    const apiPath = "v2/auth/calc/order/avail";
    const url = `${host}${apiPath}`;
    const headers = getAuthHeaders(apiPath, body);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    return json;
  } catch (err) {
    throw new Error("get available balance api error");
  }
}

export async function cancelAllFundingOffersAPI(symbol: OFFER_SYMBOL = OFFER_SYMBOL.USD) {
  try {
    const body = {
      currency: symbol.replace("f", "")
    };
    const apiPath = "v2/auth/w/funding/offer/cancel/all";
    const url = `${host}${apiPath}`;
    const headers = getAuthHeaders(apiPath, body);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    return json;
  } catch (err) {
    throw new Error("cancel all funding offers api error");
  }
}

export type SimpleResponse = {
  status: string;
  message: string;
};
export const handleResponse = (response: any): SimpleResponse => {
  if (response.length <= 3) {
    const [status, , message] = response;
    return { status, message };
  }
  const [, , , , , , status, message] = response;
  return { status, message };
};
