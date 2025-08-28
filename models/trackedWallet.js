const mongoose = require("mongoose");

const trackedWalletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },          
    wallet: { type: String, required: true, index: true }, 
    chain: { type: String, default: "ethereum" },      
  },
  { timestamps: true }
);


trackedWalletSchema.index({ userId: 1, wallet: 1, chain: 1 }, { unique: true });

module.exports = mongoose.model("TrackedWallet", trackedWalletSchema);
