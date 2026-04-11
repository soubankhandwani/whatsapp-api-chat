import crypto from "crypto";
import config from "../config/env.js";
import logger from "../utils/logger.js";

/**
 * Verify the X-Hub-Signature-256 header from Meta webhooks.
 * Must be applied BEFORE express.json() parses the body,
 * so we use the raw body buffer.
 */
export const verifyWebhookSignature = (req, res, next) => {
  // Skip in development if no app secret is configured
  if (!config.whatsappAppSecret) {
    logger.warn(
      "WHATSAPP_APP_SECRET not set — skipping signature verification",
    );
    return next();
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    logger.warn({ url: req.originalUrl }, "Missing X-Hub-Signature-256 header");
    return res.status(401).json({ error: "Missing signature" });
  }

  const rawBody = req.rawBody;
  if (!rawBody) {
    logger.error("Raw body not available for signature verification");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", config.whatsappAppSecret)
      .update(rawBody)
      .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    logger.warn("Invalid webhook signature — possible tampered payload");
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};
