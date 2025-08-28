const Alert = require("../models/Alert");

module.exports = async (ctx) => {
  try {
    const id = ctx.message.text.trim().split(" ")[1];
    if (!id) {
      return ctx.reply("⚠️ Usage: /deletealert <alert_id>");
    }

    const result = await Alert.findOneAndDelete({ _id: id, userId: ctx.from.id.toString() });
    if (!result) {
      return ctx.reply("⚠️ No alert found with that ID.");
    }

    const tokenSymbol = result.tokenSymbol || "UNKNOWN";
    const tokenName = result.tokenName || "Unknown Token";

    ctx.reply(
      `✅ <b>Alert Deleted</b>\n` +
      `• Token: ${tokenSymbol} (${tokenName})\n` +
      `• Contract: <code>${result.contract}</code>\n` +
      `• Threshold: > ${result.threshold} ${tokenSymbol}`,
      { parse_mode: "HTML" }
    );

  } catch (error) {
    console.error("❌ Error deleting alert:", error);
    ctx.reply("❌ Failed to delete alert. Please try again.");
  }
};
