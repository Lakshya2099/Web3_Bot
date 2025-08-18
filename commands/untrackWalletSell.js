const mongoose = require('mongoose');
const WalletSellAlert = require('../models/WalletSellAlert');

module.exports = async function untrackWalletSellCommand(ctx) {
  try {
    const input = ctx.message.text.trim().split(/\s+/);
    if (input.length !== 2) {
      return ctx.reply("❌ **Usage:** `/untrackwalletsell <alert_id>`", { parse_mode: "MarkdownV2" });
    }

    const alertId = input[1];
    if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return ctx.reply("❌ That doesn't look like a valid Alert ID.");
    }

    // Find and delete the alert, ensuring it belongs to the user who sent the command.
    // This is a critical security step.
    const deletedAlert = await WalletSellAlert.findOneAndDelete({
      _id: alertId,
      userId: String(ctx.from.id)
    });

    if (deletedAlert) {
      ctx.reply(`✅ Successfully deleted tracking alert for wallet \`${deletedAlert.walletAddress}\`\.`, { parse_mode: "MarkdownV2" });
    } else {
      ctx.reply("❌ Alert not found or you don't have permission to delete it.");
    }

  } catch (err) {
    console.error("❌ Error in /untrackwalletsell:", err);
    ctx.reply("❌ An error occurred while trying to delete the alert.");
  }
};