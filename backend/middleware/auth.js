import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { AuthenticationError } from "../utils/AppError.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new AuthenticationError("Access token required");
  }

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    throw new AuthenticationError("Invalid or expired access token");
  }
};
