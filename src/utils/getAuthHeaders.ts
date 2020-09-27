import { config } from 'dotenv';
config();

import { HmacSHA384 } from "crypto-js";

const { API_KEY = "", API_SECRET = "" } = process.env;
const apiKey = API_KEY;
const apiSecret = API_SECRET;

export type AuthHeader = {
  "bfx-nonce": string;
  "bfx-apikey": string;
  "bfx-signature": string;
};

function getAuthHeaders(apiPath: string, body: any): AuthHeader {
  const nonce = (Date.now() * 1000).toString();
  let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`;
  const sig = HmacSHA384(signature, apiSecret).toString();
  return {
    "bfx-nonce": nonce,
    "bfx-apikey": apiKey,
    "bfx-signature": sig
  };
}

export default getAuthHeaders;
