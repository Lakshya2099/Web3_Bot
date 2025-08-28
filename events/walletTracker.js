const { ethers } = require("ethers");
const TrackedWallet = require("../models/trackedWallet");
const provider = require("../config/provider");
const { getTokenDetails } = require("../utils/tokenUtils");

const listeningWallets = new Set();

async function listenToWallet(walletAddress, bot) {
  if (listeningWallets.has(walletAddress)) return;

  try {
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];

    
    provider.on("pending", async (txHash) => {
      try {
        const tx = await provider.getTransaction(txHash);
        if (!tx || !tx.to) return;

        
        const code = await provider.getCode(tx.to);
        if (code === "0x") return;

        const iface = new ethers.Interface(abi);
        try {
          const logs = await provider.getLogs({
            address: tx.to,
            fromBlock: "latest",
            toBlock: "latest"
          });

          for (const log of logs) {
            if (log.topics[0] !== iface.getEvent("Transfer").topicHash) continue;

            const decoded = iface.decodeEventLog("Transfer", log.data, log.topics);

            const from = decoded.from.toLowerCase();
            const to = decoded.to.toLowerCase();
            const value = decoded.value;

            if (from !== walletAddress.toLowerCase() && to !== walletAddress.toLowerCase()) continue;

           
            const { name, symbol, decimals } = await getTokenDetails(tx.to, provider);
            const formattedValue = ethers.formatUnits(value, decimals);

            const action = from === walletAddress.toLowerCase() ? "Sold" : "Bought";
            const emoji =
              symbol.toUpperCase() === "ETH" ? "💎" :
              ["USDT", "USDC", "DAI"].includes(symbol.toUpperCase()) ? "💵" :
              "🔥";

            
            await bot.telegram.sendMessage(
              walletAddress, 
              `${emoji} *Wallet Watch Alert!* \n` +
              `👤 Wallet: \`${walletAddress}\`\n` +
              `📈 Action: *${action}* ${formattedValue} ${symbol}\n` +
              `🔹 Token: ${name} (${symbol})\n` +
              `🔗 [View Tx](https://etherscan.io/tx/${tx.hash})`,
              { parse_mode: "Markdown", disable_web_page_preview: true }
            );
          }
        } catch (e) {
          
        }
      } catch (err) {
        console.error("Wallet tracker error:", err.message);
      }
    });

    listeningWallets.add(walletAddress);
    console.log(`👀 Now tracking wallet: ${walletAddress}`);
  } catch (err) {
    console.error(`❌ Failed to track wallet ${walletAddress}:`, err.message);
  }
}

module.exports = listenToWallet;
