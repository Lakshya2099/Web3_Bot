// smart_contract_alert_bot (Final Working Version)
// Install: npm install express mongoose telegraf ethers dotenv

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Telegraf } = require("telegraf");
const { ethers } = require("ethers");

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const provider = new ethers.WebSocketProvider(process.env.INFURA_WSS);

// MongoDB Schema
const alertSchema = new mongoose.Schema({
  userId: String,
  contract: String,
  threshold: String,
});
const Alert = mongoose.model("Alert", alertSchema);

// Prevent duplicate event subscriptions
const listeningContracts = new Map();

bot.start((ctx) => {
  ctx.reply("👋 Welcome! Use /addalert <contract_address> <threshold> to set up alerts.");
});

bot.command("addalert", async (ctx) => {
  try {
    const input = ctx.message.text.split(" ");
    if (input.length !== 3) return ctx.reply("❌ Usage: /addalert <contract_address> <threshold>");

    const [, contract, threshold] = input;

    if (!ethers.isAddress(contract)) return ctx.reply("❌ Invalid Ethereum address.");
    if (isNaN(threshold)) return ctx.reply("❌ Threshold must be a number.");

    await Alert.create({ userId: ctx.from.id, contract, threshold });
    ctx.reply(`✅ Alert set for ${contract} when Transfer > ${threshold}`);

    if (listeningContracts.has(contract)) return;

    const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
    const contractInstance = new ethers.Contract(contract, abi, provider);

    contractInstance.on("Transfer", async (from, to, value, event) => {
      const alerts = await Alert.find({ contract });
      let delay = 0;

      for (const alert of alerts) {
        if (value > ethers.toBigInt(alert.threshold)) {
          setTimeout(() => {
            bot.telegram.sendMessage(
              alert.userId,
              `🚨 Alert! ${value.toString()} tokens transferred on contract ${contract}`
            ).catch((err) => {
              console.error("❌ Telegram send error:", err);
            });
          }, delay);
          delay += 1200; // Stagger messages to respect Telegram rate limits
        }
      }
    });

    listeningContracts.set(contract, true);
  } catch (err) {
    console.error("Error in /addalert:", err);
    ctx.reply("❌ Something went wrong while setting alert.");
  }
});

bot.command("myalerts", async (ctx) => {
  const alerts = await Alert.find({ userId: ctx.from.id });
  if (alerts.length === 0) return ctx.reply("📭 No active alerts found.");

  let message = "📋 Your Alerts:\n";
  alerts.forEach((a, i) => {
    message += `${i + 1}. ID: ${a._id}\n   Contract: ${a.contract}\n   Threshold: ${a.threshold}\n`;
  });
  ctx.reply(message);
});

bot.command("deletealert", async (ctx) => {
  const input = ctx.message.text.split(" ");
  if (input.length !== 2) return ctx.reply("❌ Usage: /deletealert <alert_id>");
  const [, alertId] = input;

  const result = await Alert.deleteOne({ _id: alertId, userId: ctx.from.id });
  ctx.reply(result.deletedCount ? "🗑️ Alert deleted." : "❌ Alert not found.");
});

bot.launch();

app.listen(3000, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      ssl: true,
    });
    console.log("✅ MongoDB connected successfully");
    console.log("🚀 Bot server running on port 3000");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
});
