// import axios from 'axios';
// import dotenv from 'dotenv';
// dotenv.config();

// const API_VERSION = 'v22.0';
// const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${process.env.PHONE_NUMBER_ID}`;

export const sendTemplate = async (to) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("WhatsApp API error:", error.response?.data || error.message);
    throw new Error("Failed to send template message via WhatsApp API");
  }
};

import axios from "axios";
import config from "../config/env.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

const BASE_URL = `https://graph.facebook.com/${config.whatsappApiVersion}/${config.phoneNumberId}`;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function callWithRetry(fn, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error.response?.status;
      // Don't retry on 4xx client errors (except 429 rate limit)
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw error;
      }
      if (attempt === retries) throw error;

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(
        { attempt, delay, status },
        "WhatsApp API call failed, retrying",
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export const sendTextMessage = async (to, message) => {
  try {
    const response = await callWithRetry(() =>
      axios.post(
        `${BASE_URL}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: message, preview_url: false },
        },
        {
          headers: {
            Authorization: `Bearer ${config.whatsappToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      ),
    );

    logger.info(
      { to, messageId: response.data?.messages?.[0]?.id },
      "WhatsApp message sent",
    );
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    logger.error(
      { to, error: apiError || error.message },
      "WhatsApp API send failed",
    );
    throw new AppError(
      apiError?.message || "Failed to send message via WhatsApp API",
      error.response?.status || 502,
      "WHATSAPP_API_ERROR",
    );
  }
};

// sendTextMessage('919137198164', 'Hello from Node.js WhatsApp API!')
//   .then(console.log)
//   .catch(console.error);

// sendTemplate('919167024980').then(console.log).catch(console.error);
