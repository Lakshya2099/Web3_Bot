// commands/untrackWallet.js
const TrackedWallet = require("../models/trackedWallet");

module.exports = async function untrackWalletCommand(ctx) {
  const parts = (ctx.message?.text || "").trim().split(/\s+/);
  if (parts.length < 2) {
    return ctx.reply("❌ Usage: /untrackwallet <id_or_address>");
  }
  const key = parts[1].toLowerCase();

  let res;
  if (key.startsWith("0x") && key.length === 42) {
    res = await TrackedWallet.deleteOne({ userId: String(ctx.from.id), wallet: key });
  } else {
    res = await TrackedWallet.deleteOne({ userId: String(ctx.from.id), _id: key });
  }

  if (res.deletedCount) return ctx.reply("🗑️ Wallet untracked.");
  return ctx.reply(
  `🛑 *Stopped Tracking Wallet!*\n\n` +
  `👛 Address: \`${walletAddress}\`\n` +
  `🚫 _You will no longer get updates for this wallet._`,
  { parse_mode: "Markdown" }
);

};
