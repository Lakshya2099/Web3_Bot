const { ethers } = require("ethers");
const TrackedFullWallet = require("../models/TrackedFullWallet");

module.exports = async function trackFullWalletCommand(ctx) {
    try {
        const input = ctx.message.text.trim().split(/\s+/);
        if (input.length !== 3) {
            return ctx.reply("❌ Usage: <code>/trackfullwallet &lt;wallet_address&gt; &lt;name&gt;</code>", { parse_mode: "HTML" });
        }
        const walletAddress = input[1];
        const walletName = input[2];

        if (!ethers.isAddress(walletAddress)) {
            return ctx.reply("❌ Invalid wallet address.");
        }

        const existing = await TrackedFullWallet.findOne({
            userId: String(ctx.from.id),
            walletAddress: walletAddress.toLowerCase(),
        });

        if (existing) {
            return ctx.reply(`✅ You are already tracking this wallet as '<b>${existing.walletName}</b>'.`, { parse_mode: "HTML" });
        }

        await TrackedFullWallet.create({
            userId: String(ctx.from.id),
            walletAddress: walletAddress.toLowerCase(),
            walletName: walletName,
        });

        ctx.reply(`✅ **Now tracking:** ${walletName} (<code>${walletAddress}</code>)`, { parse_mode: "HTML" });

    } catch (err) {
        if (err.code === 11000) {
            return ctx.reply("❌ You already have a wallet tracked with that name. Please choose a unique name.");
        }
        console.error("Error in /trackfullwallet:", err);
        ctx.reply("❌ Failed to start tracking the wallet.");
    }
};