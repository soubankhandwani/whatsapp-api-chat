import { authService } from "../services/authService.js";
import config from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: "strict",
  domain: config.cookieDomain,
  path: "/",
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth", // Only sent on auth routes for refresh
  });
}

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
    );
    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
    );
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(token);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", { ...COOKIE_OPTIONS, path: "/api/auth" });
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
