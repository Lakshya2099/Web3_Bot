// commands/addAlert.js
const { ethers } = require("ethers");
const Alert = require("../models/Alert");
const provider = require("../config/provider");

/**
 * Minimal ERC-20 to fetch name/symbol/decimals
 */
const ERC20_META_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

async function fetchTokenMeta(address) {
  try {
   
    const code = await provider.getCode(address);
    if (code === '0x') {
      console.warn(`No contract found at address: ${address}`);
      return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
    }

    const c = new ethers.Contract(address, ERC20_META_ABI, provider);
    let name = "Unknown Token";
    let symbol = "UNKNOWN";
    let decimals = 18;

    try { name = await c.name(); } catch (e) { 
      console.warn(`Could not fetch name: ${e.message}`);
    }
    try { symbol = await c.symbol(); } catch (e) {
      console.warn(`Could not fetch symbol: ${e.message}`);
    }
    try {
      const d = await c.decimals();
      if (typeof d === "number") decimals = d;
    } catch (e) {
      console.warn(`Could not fetch decimals: ${e.message}`);
    }
    
    return { name, symbol, decimals };
  } catch (error) {
    console.error(`Error in fetchTokenMeta for ${address}:`, error.message);
    return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
  }
}

module.exports = async function addAlertCommand(ctx, bot, startListeningForContract) {
  try {
    // Validate context and message
    if (!ctx) {
      console.error("Context is undefined");
      return;
    }

    if (!ctx.message) {
      console.error("Message is undefined in context:", ctx);
      return ctx.reply("❌ Invalid update type. Please use text messages.");
    }

    if (!ctx.message.text) {
      return ctx.reply("❌ No text found in message. Please send a text command.");
    }

    const input = ctx.message.text.trim().split(/\s+/);
    if (input.length !== 3) {
      return ctx.reply("❌ Usage: <code>/addalert &lt;contract_address&gt; &lt;threshold&gt;</code>", { parse_mode: "HTML" });
    }

    const [, contract, thresholdStr] = input;

    if (!ethers.isAddress(contract)) {
      return ctx.reply("❌ Invalid Ethereum address.");
    }
    if (!/^\d+(\.\d+)?$/.test(thresholdStr)) {
      return ctx.reply("❌ Threshold must be a positive number (in token units).");
    }

    const token = await fetchTokenMeta(contract);
    const doc = await Alert.create({
      userId: String(ctx.from.id),
      contract: contract.toLowerCase(),
      threshold: Number(thresholdStr), // token units
      tokenName: token.name,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
    });

    const msg =
      `✅ <b>Alert Added</b>\n` +
      `• <b>Token</b>: ${token.symbol} (${token.name})\n` +
      `• <b>Contract</b>: <code>${contract}</code>\n` +
      `• <b>Threshold</b>: &gt; ${thresholdStr} ${token.symbol}\n` +
      `• <b>ID</b>: <code>${doc._id}</code>`;
    await ctx.reply(msg, { parse_mode: "HTML" });

    
    startListeningForContract(contract, bot);

  } catch (err) {
    console.error("❌ Error adding alert:", err);
    if (ctx.reply) {
      ctx.reply("❌ Failed to add alert. Please try again.");
    }
  }
};
