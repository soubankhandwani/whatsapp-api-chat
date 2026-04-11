import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  // WhatsApp
  whatsappToken: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET,
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || "v22.0",

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim()),

  // Cookies
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSecure: process.env.NODE_ENV === "production",
};

// Validate required env vars at startup
const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "WHATSAPP_TOKEN",
  "PHONE_NUMBER_ID",
  "WEBHOOK_VERIFY_TOKEN",
];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

export default config;
