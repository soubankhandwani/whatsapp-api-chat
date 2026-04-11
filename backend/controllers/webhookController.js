// import Message from '../models/Message.js';
// export const verifyWebhook = (req, res) => {
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];

//   if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
//     console.log('Webhook verified successfully');
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// };

// export const handleWebhook = async (req, res) => {
//   try {
//     const entry = req.body.entry[0];
//     const changes = entry.changes[0];
//     const value = changes.value;

//     if (value.messages) {
//       const message = value.messages[0];
//       const from = message.from;
//       const msgBody = message.text.body;

//       // Save to MongoDB
//       await Message.create({
//         user: from,
//         message: msgBody,
//         direction: 'incoming',
//         timestamp: new Date(),
//       });
//     }
//     console.log('Webhook event received:', req.body);
//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Webhook error:', error);
//     res.status(500).json({ error: 'Webhook processing failed' });
//   }
// };

import config from "../config/env.js";
import { webhookService } from "../services/webhookService.js";
import logger from "../utils/logger.js";

/**
 * GET /api/webhook — Meta webhook verification.
 * Must respond with the challenge to register the webhook.
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.webhookVerifyToken) {
    logger.info("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  logger.warn(
    { mode, tokenMatch: token === config.webhookVerifyToken },
    "Webhook verification failed",
  );
  res.sendStatus(403);
};

/**
 * POST /api/webhook — Receive events from WhatsApp.
 *
 * CRITICAL: Must respond 200 within 5 seconds or Meta will retry.
 * We respond immediately, then process asynchronously.
 */
export const handleWebhook = async (req, res) => {
  // Respond 200 IMMEDIATELY — Meta requires <5s response
  res.sendStatus(200);

  try {
    logger.info(
      { body: JSON.stringify(req.body).slice(0, 500) },
      "Webhook received",
    );

    const entry = req.body.entry?.[0];
    if (!entry) return;

    const changes = entry.changes?.[0];
    if (!changes || changes.field !== "messages") return;

    const value = changes.value;
    const io = req.app.get("io");

    // Process incoming messages
    if (value.messages) {
      for (const msg of value.messages) {
        try {
          await processMessage(msg, value, io);
        } catch (err) {
          logger.error(
            { err, messageId: msg.id },
            "Failed to process incoming message",
          );
        }
      }
    }

    // Process status updates (sent/delivered/read)
    if (value.statuses) {
      for (const status of value.statuses) {
        try {
          await processStatus(status, io);
        } catch (err) {
          logger.error(
            { err, messageId: status.id },
            "Failed to process status update",
          );
        }
      }
    }
  } catch (error) {
    // We already sent 200 — just log the error
    logger.error({ err: error }, "Webhook processing failed");
  }
};

async function processMessage(msg, value, io) {
  const from = msg.from;
  const body = msg.text?.body;
  const whatsappMessageId = msg.id;
  const timestamp = msg.timestamp;

  if (!body) {
    logger.info(
      { type: msg.type, from },
      "Non-text message received (skipped)",
    );
    return;
  }

  const saved = await webhookService.processIncomingMessage({
    from,
    body,
    whatsappMessageId,
    timestamp,
  });

  // Only emit if it's a new message (not a duplicate)
  if (saved && io) {
    io.emit("new-message", saved);
    logger.debug(
      { from, whatsappMessageId },
      "Emitted new-message socket event",
    );
  }
}

async function processStatus(status, io) {
  const updated = await webhookService.processStatusUpdate({
    whatsappMessageId: status.id,
    status: status.status,
  });

  if (updated && io) {
    io.emit("message-status", {
      whatsappMessageId: status.id,
      status: status.status,
      user: updated.user,
    });
  }
}
