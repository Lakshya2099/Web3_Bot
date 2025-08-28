const { ethers } = require("ethers");

const INFURA_WSS = process.env.INFURA_WSS;
if (!INFURA_WSS) {
  throw new Error("❌ Missing INFURA_WSS in .env");
}

const provider = new ethers.WebSocketProvider(INFURA_WSS);


(async () => {
  try {
    const net = await provider.getNetwork();
    console.log(`✅ Connected to ${net.name} (chainId: ${net.chainId})`);
  } catch (err) {
    console.error("❌ Provider network check failed:", err.message);
  }
})();

module.exports = provider;
