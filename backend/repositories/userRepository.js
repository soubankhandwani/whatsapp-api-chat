import User from "../models/User.js";

export const userRepository = {
  async create(data) {
    return User.create(data);
  },

  async findByEmail(email) {
    return User.findOne({ email });
  },

  async findByEmailWithPassword(email) {
    return User.findOne({ email }).select("+password +refreshTokenHash");
  },

  async findById(id) {
    return User.findById(id);
  },

  async findByIdWithRefreshToken(id) {
    return User.findById(id).select("+refreshTokenHash");
  },

  async updateRefreshToken(id, hashedToken) {
    return User.findByIdAndUpdate(id, { refreshTokenHash: hashedToken });
  },

  async clearRefreshToken(id) {
    return User.findByIdAndUpdate(id, { $unset: { refreshTokenHash: 1 } });
  },
};
