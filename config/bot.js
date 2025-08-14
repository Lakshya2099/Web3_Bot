// config/bot.js
const { Telegraf } = require("telegraf");

if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing in .env");
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

module.exports = bot;
