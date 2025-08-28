const TrackedFullWallet = require('../models/TrackedFullWallet');

module.exports = async function untrackFullWalletCommand(ctx) {
  try {
    const input = ctx.message.text.trim().split(/\s+/);
    if (input.length !== 2) {
      return ctx.reply("❌ Usage: <code>/untrackfullwallet &lt;name&gt;</code>", { parse_mode: "HTML" });
    }

    const walletName = input[1];

    const deletedWallet = await TrackedFullWallet.findOneAndDelete({
      walletName: walletName,
      userId: String(ctx.from.id)
    });

    if (deletedWallet) {
      ctx.reply(`✅ **Stopped tracking:** ${deletedWallet.walletName} (<code>${deletedWallet.walletAddress}</code>)`, { parse_mode: "HTML" });
    } else {
      ctx.reply("❌ You are not tracking a wallet with that name.");
    }

  } catch (err) {
    console.error("❌ Error in /untrackfullwallet:", err);
    ctx.reply("❌ An error occurred while trying to untrack the wallet.");
  }
};