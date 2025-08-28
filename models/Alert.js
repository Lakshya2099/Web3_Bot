const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true, required: true },
    contract: { type: String, index: true, required: true }, // lowercase address
    threshold: { type: Number, required: true }, // human units (e.g., 10 USDC)
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    tokenDecimals: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", AlertSchema);
