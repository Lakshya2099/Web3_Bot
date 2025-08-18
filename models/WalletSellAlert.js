const mongoose = require('mongoose');

const WalletSellAlertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  tokenName: String,
  tokenSymbol: String,
  tokenDecimals: Number,
}, { timestamps: true });

module.exports = mongoose.model('WalletSellAlert', WalletSellAlertSchema);