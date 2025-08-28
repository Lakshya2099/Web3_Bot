const Alert = require("../models/Alert");

module.exports = async function clearAlertsCommand(ctx, bot) {
    try {
        if (!ctx.message || !ctx.message.text) {
            return ctx.reply("❌ Invalid command format.");
        }

        const userId = String(ctx.from.id);
        
        
        const countBefore = await Alert.countDocuments({ userId });
        console.log(`User ${userId} has ${countBefore} alerts`);
        
        if (countBefore === 0) {
            return ctx.reply("ℹ️ You have no alerts to clear.");
        }

        
        const result = await Alert.deleteMany({ userId });
        console.log(`Deletion result for user ${userId}:`, result);
        
        await ctx.reply(
            `✅ <b>Your Alerts Cleared Successfully</b>\n` +
            `• Deleted: ${result.deletedCount} of your alerts\n` +
            `• Your alerts are now cleared`,
            { parse_mode: "HTML" }
        );

        console.log(`User ${userId} cleared their alerts: ${result.deletedCount} alerts deleted`);

    } catch (err) {
        console.error("❌ Error clearing user alerts:", err);
        if (ctx.reply) {
            ctx.reply("❌ Failed to clear your alerts. Please try again.");
        }
    }
};
