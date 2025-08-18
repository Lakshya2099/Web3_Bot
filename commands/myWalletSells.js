// commands/myWalletSells.js
const WalletSellAlert = require('../models/WalletSellAlert');

module.exports = async function myWalletSellsCommand(ctx) {
  try {
    const userId = String(ctx.from.id);
    const alerts = await WalletSellAlert.find({ userId: userId });

    if (alerts.length === 0) {
      return ctx.reply("You are not tracking any wallet sells. Use <code>/trackwalletsell</code> to start.", { parse_mode: "HTML" });
    }

    let message = "<b>Your Tracked Wallet Sells:</b>\n\n";
    alerts.forEach(alert => {
      message += 
        `<b>Wallet</b>: <code>${alert.walletAddress}</code>\n` +
        `<b>Token</b>: ${alert.tokenSymbol}\n` +
        `<b>Threshold</b>: ≥ ${alert.threshold} ${alert.tokenSymbol}\n` +
        `<b>ID</b>: <code>${alert._id}</code>\n` +
        `------------------------------------\n`;
    });

    await ctx.reply(message, { parse_mode: "HTML" });

  } catch (err) {
    console.error("❌ Error in /mywalletsells:", err);
    ctx.reply("❌ An error occurred while fetching your tracked wallets.");
  }
};