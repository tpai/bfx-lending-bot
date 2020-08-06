require("dotenv").config();

const CryptoJS = require("crypto-js");

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

module.exports = function(apiPath, body) {
  const nonce = (Date.now() * 1000).toString();
  let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`;
  const sig = CryptoJS.HmacSHA384(signature, apiSecret).toString();
  return {
    "bfx-nonce": nonce,
    "bfx-apikey": apiKey,
    "bfx-signature": sig
  };
};
