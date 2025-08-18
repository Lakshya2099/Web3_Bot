require("dotenv").config();
const mongoose = require("mongoose");
const bot = require("./config/bot");
const { initializeAllListeners, startListeningForContract } = require("./events/transferListener");
const { startPolling } = require('./services/walletPoller'); // <-- ADDED: Import the new poller service

// --- General Alert Commands ---
const addAlertCommand = require("./commands/addAlert");
const deleteAlertCommand = require("./commands/deleteAlert");
const myAlertsCommand = require("./commands/myAlerts");
const clearAlertsCommand = require("./commands/clearAlerts");

// --- Specific Wallet Sell Tracking Commands ---
const trackWalletSellCommand = require("./commands/trackWalletSell");
const untrackWalletSellCommand = require("./commands/untrackWalletSell");
const myWalletSellsCommand = require("./commands/myWalletSells");
const clearWalletSellsCommand = require("./commands/clearWalletSells");

// --- Advanced Wallet Tracking Command ---
const trackFullWalletCommand = require('./commands/trackFullWallet'); // <-- ADDED: Import the new command
const untrackFullWalletCommand = require('./commands/untrackFullWallet');
const myFullWalletsCommand = require('./commands/myFullWallets');
const clearFullWalletsCommand = require('./commands/clearFullWallets');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB connected successfully");
    // Start listeners and services only AFTER the database connection is successful
    initializeAllListeners(); // Starts the original event listener
    startPolling();           // <-- ADDED: Starts the new advanced polling service
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});

// --- Register General Alert Commands ---
bot.command('addalert', (ctx) => {
    addAlertCommand(ctx, bot, startListeningForContract);
});
bot.command('deletealert', deleteAlertCommand);
bot.command('myalerts', myAlertsCommand);
bot.command('clearall', clearAlertsCommand);

// --- Register Specific Wallet Sell Tracking Commands ---
bot.command('trackwalletsell', (ctx) => {
    trackWalletSellCommand(ctx, bot, startListeningForContract);
});
bot.command('untrackwalletsell', untrackWalletSellCommand);
bot.command('mywalletsells', myWalletSellsCommand);
bot.command('clearwalletsells', clearWalletSellsCommand);

// --- Register Advanced Wallet Tracking Command ---
bot.command('trackfullwallet', trackFullWalletCommand); // <-- ADDED: Register the new command
bot.command('untrackfullwallet', untrackFullWalletCommand); 
bot.command('myfullwallets', myFullWalletsCommand);
bot.command('clearfullwallets', clearFullWalletsCommand);

// Launch Telegram bot
bot.launch();
console.log("🚀 Bot server running...");

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));