import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { AuthenticationError, ConflictError } from "../utils/AppError.js";

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiry },
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user._id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiry,
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authService = {
  async register({ email, password, name }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const user = await userRepository.create({ email, password, name });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userRepository.updateRefreshToken(user._id, hashToken(refreshToken));

    return {
      user: { id: user._id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userRepository.updateRefreshToken(user._id, hashToken(refreshToken));

    return {
      user: { id: user._id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AuthenticationError("Refresh token required");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    } catch {
      throw new AuthenticationError("Invalid refresh token");
    }

    const user = await userRepository.findByIdWithRefreshToken(decoded.sub);
    if (!user || !user.refreshTokenHash) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const isValid = user.refreshTokenHash === hashToken(refreshToken);
    if (!isValid) {
      // Token reuse detected — invalidate all sessions
      await userRepository.clearRefreshToken(user._id);
      throw new AuthenticationError(
        "Token reuse detected — please login again",
      );
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await userRepository.updateRefreshToken(
      user._id,
      hashToken(newRefreshToken),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
  },
};
