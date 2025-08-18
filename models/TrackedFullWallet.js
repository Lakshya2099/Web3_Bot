const mongoose = require('mongoose');

const TrackedFullWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  walletAddress: { type: String, required: true, lowercase: true, index: true },
  lastTxHash: { type: String, default: null },
  walletName: { type: String, required: true }, // <-- ADDED THIS FIELD
}, { timestamps: true });

// Add a compound index to ensure a user cannot add the same name twice
TrackedFullWalletSchema.index({ userId: 1, walletName: 1 }, { unique: true });

module.exports = mongoose.model('TrackedFullWallet', TrackedFullWalletSchema);