const TrackedFullWallet = require('../models/TrackedFullWallet');

module.exports = async function myFullWalletsCommand(ctx) {
  try {
    const userId = String(ctx.from.id);
    const wallets = await TrackedFullWallet.find({ userId: userId });

    if (wallets.length === 0) {
      return ctx.reply("You are not tracking any wallets' full activity.\nUse `/trackfullwallet <address> <name>` to start.", { parse_mode: "HTML" });
    }

    let message = "<b>🔔 You are tracking all activity for the following wallets:</b>\n\n";
    
    // CHANGED: Display the wallet name and address
    wallets.forEach(wallet => {
      message += `• <b>${wallet.walletName}</b>\n  <code>${wallet.walletAddress}</code>\n`;
    });

    await ctx.reply(message, { parse_mode: "HTML" });

  } catch (err) {
    console.error("❌ Error in /myfullwallets:", err);
    ctx.reply("❌ An error occurred while fetching your tracked wallets.");
  }
};