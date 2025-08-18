const TrackedFullWallet = require('../models/TrackedFullWallet');

module.exports = async function clearFullWalletsCommand(ctx) {
  try {
    const userId = String(ctx.from.id);

    const result = await TrackedFullWallet.deleteMany({ userId: userId });

    if (result.deletedCount > 0) {
      ctx.reply(`✅ Successfully cleared ${result.deletedCount} fully tracked wallet(s).`);
    } else {
      ctx.reply("You had no fully tracked wallets to clear.");
    }

  } catch (err) {
    console.error("❌ Error in /clearfullwallets:", err);
    ctx.reply("❌ An error occurred while clearing your wallets.");
  }
};