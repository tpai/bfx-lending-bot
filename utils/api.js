const fetch = require("node-fetch");
const queryString = require("query-string");
const getAuthHeaders = require("./getAuthHeaders");

const host = "https://api.bitfinex.com/";
const pubHost = "https://api-pub.bitfinex.com/";

module.exports = {
  getTradesAPI: async (symbol = "fUSD", { limit = 30, sort = -1 } = {}) => {
    try {
      const url = `${pubHost}v2/trades/${symbol}/hist?${queryString.stringify({
        limit,
        sort
      })}`;
      const res = await fetch(url);
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
      return { err: "get trades api error" };
    }
  },
  createOfferAPI: async ({ symbol = "fUSD", offer, avg, per }) => {
    try {
      const body = {
        type: "LIMIT",
        symbol,
        amount: `${offer}`,
        rate: avg,
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
      console.log(err);
      return { err: "create offer api error" };
    }
  },
  getWalletsAPI: async () => {
    try {
      const apiPath = "v2/auth/r/wallets";
      const url = `${host}${apiPath}`;
      const headers = getAuthHeaders(apiPath, {});
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify({})
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
      return { err: "get wallets api error" };
    }
  },
  getAvailableBalanceAPI: async (symbol = "fUSD") => {
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
      console.log(err);
      return { err: "get available balance api error" };
    }
  },
  cancelAllFundingOffersAPI: async body => {
    try {
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
      return { err: "cancel all funding offers api error" };
    }
  }
};
