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
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw new Error('Failed to send template message via WhatsApp API');
  }
};

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_VERSION = 'v22.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${process.env.PHONE_NUMBER_ID}`;

export const sendTextMessage = async (to, message) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          body: message,
          preview_url: false, // set to true if message contains a link and you want link preview
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw new Error('Failed to send message via WhatsApp API');
  }
};

// sendTextMessage('919137198164', 'Hello from Node.js WhatsApp API!')
//   .then(console.log)
//   .catch(console.error);

// sendTemplate('919167024980').then(console.log).catch(console.error);
