// commands/trackWallet.js
const { ethers } = require("ethers");
const TrackedWallet = require("../models/trackedWallet");
const listenToWallet = require("../events/walletTracker");

module.exports = async function trackWalletCommand(ctx, bot) {
  const parts = (ctx.message?.text || "").trim().split(/\s+/);
  if (parts.length < 2) {
    return ctx.reply("❌ Usage: /trackwallet <wallet_address>");
  }
  const wallet = parts[1].toLowerCase();

  if (!ethers.isAddress(wallet)) {
    return ctx.reply("❌ Invalid Ethereum address.");
  }

  try {
    const doc = await TrackedWallet.create({
      userId: String(ctx.from.id),
      wallet,
      chain: "ethereum",
    });

    // start (or re-use) a listener for this wallet
    await listenToWallet(wallet, bot);

    return ctx.reply(`✅ Tracking wallet ${wallet}\nYou will receive ERC-20 token IN/OUT alerts.`);
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key
      await listenToWallet(wallet, bot); // ensure listener is running anyway
      return ctx.reply("ℹ️ You already track this wallet. Listener ensured.");
    }
    console.error("trackWallet error:", err);
    return ctx.reply(
  `👀 *Wallet Tracking Started!*\n\n` +
  `👛 *Address:* \`${walletAddress}\`\n` +
  `📢 _We’ll notify you whenever this wallet buys or sells tokens!_`,
  { parse_mode: "Markdown" }
);

  }
};
