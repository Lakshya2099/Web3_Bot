// commands/clearWalletSells.js
const WalletSellAlert = require('../models/WalletSellAlert');

module.exports = async function clearWalletSellsCommand(ctx) {
  try {
    const userId = String(ctx.from.id);

    const result = await WalletSellAlert.deleteMany({ userId: userId });

    if (result.deletedCount > 0) {
      ctx.reply(`✅ Successfully cleared ${result.deletedCount} wallet tracking alert(s).`);
    } else {
      ctx.reply("You had no wallet tracking alerts to clear.");
    }

  } catch (err) {
    console.error("❌ Error in /clearwalletsells:", err);
    ctx.reply("❌ An error occurred while clearing your alerts.");
  }
};