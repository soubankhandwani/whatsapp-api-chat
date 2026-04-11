import { messageRepository } from "../repositories/messageRepository.js";
import logger from "../utils/logger.js";

export const webhookService = {
  /**
   * Process an incoming WhatsApp message.
   * Uses whatsappMessageId for idempotency — if we already processed it, skip.
   */
  async processIncomingMessage({ from, body, whatsappMessageId, timestamp }) {
    // Idempotency check
    if (whatsappMessageId) {
      const existing =
        await messageRepository.findByWhatsappId(whatsappMessageId);
      if (existing) {
        logger.info({ whatsappMessageId }, "Duplicate message skipped");
        return null;
      }
    }

    const message = await messageRepository.create({
      user: from,
      message: body,
      direction: "incoming",
      status: "delivered",
      read: false,
      whatsappMessageId,
    });

    logger.info({ from, whatsappMessageId }, "Incoming message saved");
    return message;
  },

  /**
   * Process a status update (sent/delivered/read) for an outgoing message.
   */
  async processStatusUpdate({ whatsappMessageId, status }) {
    if (!whatsappMessageId) return null;

    const statusMap = {
      sent: "sent",
      delivered: "delivered",
      read: "read",
      failed: "failed",
    };

    const mappedStatus = statusMap[status];
    if (!mappedStatus) {
      logger.warn({ status, whatsappMessageId }, "Unknown status update");
      return null;
    }

    const updated = await messageRepository.updateStatusByWhatsappId(
      whatsappMessageId,
      mappedStatus,
    );

    if (updated) {
      logger.info(
        { whatsappMessageId, status: mappedStatus },
        "Message status updated",
      );
    } else {
      logger.warn({ whatsappMessageId }, "Status update for unknown message");
    }

    return updated;
  },
};
