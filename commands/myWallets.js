// commands/myWallets.js
const TrackedWallet = require("../models/trackedWallet");

module.exports = async function myWalletsCommand(ctx) {
  const list = await TrackedWallet.find({ userId: String(ctx.from.id) }).sort({ createdAt: -1 });
  if (wallets.length === 0) {
  return ctx.reply(`ℹ️ *You’re not tracking any wallets.*\n\nUse /trackwallet to start!`, { parse_mode: "Markdown" });
}

let message = `📋 *Tracked Wallets:*\n\n`;
wallets.forEach((wallet, i) => {
  message += `🔹 *${i + 1}.* \`${wallet.address}\`\n`;
});
ctx.reply(message, { parse_mode: "Markdown" });

};
