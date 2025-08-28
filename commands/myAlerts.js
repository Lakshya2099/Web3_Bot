const Alert = require("../models/Alert");

module.exports = async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const alerts = await Alert.find({ userId });

    console.log("DEBUG: Alerts for user:", userId, alerts);

    if (alerts.length === 0) {
      return ctx.reply("📋 You have no active alerts.");
    }

    let message = "📋 <b>Your Active Alerts:</b>\n\n";
    alerts.forEach((alert, index) => {
      // Use the correct field names from your Alert model
      const tokenSymbol = alert.tokenSymbol || "UNKNOWN";
      const tokenName = alert.tokenName || "Unknown Token";
      
      message += `🔹 <b>${index + 1}.</b> ${tokenSymbol}\n`;
      message += `   💎 Token: ${tokenSymbol} (${tokenName})\n`;
      message += `   🆔 ID: <code>${alert._id}</code>\n`;
      message += `   📜 Contract: <code>${alert.contract}</code>\n`;
      message += `   📊 Threshold: > ${alert.threshold} ${tokenSymbol}\n\n`;
    });

    ctx.reply(message, { parse_mode: "HTML" });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    ctx.reply("❌ Failed to fetch your alerts.");
  }
};
