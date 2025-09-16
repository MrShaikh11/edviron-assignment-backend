import axios from "axios";
import jwt from "jsonwebtoken";

const createCollectRequest = async ({ amount, callback_url }) => {
  if (!process.env.PG_KEY)
    throw new Error("PG_KEY not configured in environment variables");
  if (!process.env.PAYMENT_API_KEY)
    throw new Error("PAYMENT_API_KEY not configured in environment variables");
  if (!process.env.PG_CREATE_URL)
    throw new Error("PG_CREATE_URL not configured in environment variables");
  if (!process.env.SCHOOL_ID)
    throw new Error("SCHOOL_ID not configured in environment variables");

  // payload that the gateway expects to be signed
  const payload = {
    school_id: process.env.SCHOOL_ID,
    amount: String(amount),
    callback_url,
  };

  // sign with PG secret key using HS256
  const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });
  console.log("Sign", sign);
  const body = {
    ...payload,
    sign,
  };

  const headers = {
    Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const resp = await axios.post(process.env.PG_CREATE_URL, body, {
      headers,
      timeout: 15000,
    });
    return resp.data; // should include collect_request_id + collect_request_url
  } catch (err) {
    console.error(
      "Error calling createCollectRequest:",
      err.response?.data || err.message
    );
    throw err;
  }
};

const getCollectRequest = async (collect_request_id) => {
  if (!process.env.PG_KEY)
    throw new Error("PG_KEY not configured in environment variables");
  if (!process.env.SCHOOL_ID)
    throw new Error("SCHOOL_ID not configured in environment variables");
  if (!process.env.PG_GET_URL)
    throw new Error("PG_GET_URL not configured in environment variables");

  // payload for signing
  const payload = {
    school_id: process.env.SCHOOL_ID,
    collect_request_id,
  };

  const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

  const url = `${process.env.PG_GET_URL}/${collect_request_id}?school_id=${process.env.SCHOOL_ID}&sign=${sign}`;

  try {
    const resp = await axios.get(url, { timeout: 15000 });
    return resp.data; // should contain order status + details
  } catch (err) {
    console.error(
      "Error calling getCollectRequest:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export default { createCollectRequest, getCollectRequest };
