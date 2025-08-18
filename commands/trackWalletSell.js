const { ethers } = require("ethers");
const WalletSellAlert = require("../models/WalletSellAlert");
const { fetchTokenMeta } = require("../utils/tokenUtils");

module.exports = async function trackWalletSellCommand(ctx, bot, startListeningForContract) {
  try {
    const input = ctx.message.text.trim().split(/\s+/);
    if (input.length !== 4) {
      return ctx.reply("❌ Usage: <code>/trackwalletsell &lt;wallet_address&gt; &lt;token_contract&gt; &lt;threshold&gt;</code>", { parse_mode: "HTML" });
    }

    const [, walletAddress, contractAddress, thresholdStr] = input;

    if (!ethers.isAddress(walletAddress)) return ctx.reply("❌ Invalid wallet address.");
    if (!ethers.isAddress(contractAddress)) return ctx.reply("❌ Invalid token contract address.");
    if (isNaN(parseFloat(thresholdStr)) || parseFloat(thresholdStr) < 0) return ctx.reply("❌ Threshold must be a non-negative number.");
    
    const threshold = parseFloat(thresholdStr);
    const token = await fetchTokenMeta(contractAddress);
    
    const doc = await WalletSellAlert.create({
      userId: String(ctx.from.id),
      walletAddress: walletAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      threshold: threshold,
      tokenName: token.name,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
    });

    const msg =
      `✅ <b>Tracking Wallet Sells</b>\n\n` +
      `<b>Wallet</b>: <code>${walletAddress}</code>\n` +
      `<b>Token</b>: ${token.symbol}\n` +
      `<b>Alert when sale is ≥</b>: ${threshold} ${token.symbol}\n` +
      `<b>Alert ID</b>: <code>${doc._id}</code>`;

    await ctx.reply(msg, { parse_mode: "HTML" });

    // Tell our listener manager to start listening to this token if it isn't already
    startListeningForContract(contractAddress);

  } catch (err) {
    console.error("❌ Error tracking wallet sell:", err);
    ctx.reply("❌ Failed to add tracking alert. Please try again.");
  }
};