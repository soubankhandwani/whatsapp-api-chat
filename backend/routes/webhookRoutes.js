import express from "express";
import {
  verifyWebhook,
  handleWebhook,
} from "../controllers/webhookController.js";
import { verifyWebhookSignature } from "../middleware/webhookSignature.js";

const router = express.Router();

// GET — Meta webhook verification (no signature check needed)
router.get("/", verifyWebhook);

// POST — Incoming webhook events (with signature verification)
router.post("/", verifyWebhookSignature, handleWebhook);

export default router;
