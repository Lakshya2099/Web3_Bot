// config/provider.js
const { ethers } = require("ethers");

const INFURA_WSS = process.env.INFURA_WSS;
if (!INFURA_WSS) {
  throw new Error("❌ Missing INFURA_WSS in .env");
}

// Use WebSocketProvider so we can subscribe to logs
const provider = new ethers.WebSocketProvider(INFURA_WSS);

// (Optional) warm-up check without relying on private fields
(async () => {
  try {
    const net = await provider.getNetwork();
    console.log(`✅ Connected to ${net.name} (chainId: ${net.chainId})`);
  } catch (err) {
    console.error("❌ Provider network check failed:", err.message);
  }
})();

module.exports = provider;
