// models/TrackedWallet.js
const mongoose = require("mongoose");

const trackedWalletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },          // Telegram user id
    wallet: { type: String, required: true, index: true }, // lowercased 0x...
    chain: { type: String, default: "ethereum" },       // future multi-chain
  },
  { timestamps: true }
);

// prevent duplicates per user+wallet+chain
trackedWalletSchema.index({ userId: 1, wallet: 1, chain: 1 }, { unique: true });

module.exports = mongoose.model("TrackedWallet", trackedWalletSchema);
