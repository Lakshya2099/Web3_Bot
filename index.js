// index.js
require("dotenv").config();
const mongoose = require("mongoose");
const bot = require("./config/bot");
const { startTransferListeners } = require("./events/transferListener");

// Import command functions
const addAlertCommand = require("./commands/addAlert");
const deleteAlertCommand = require("./commands/deleteAlert");
const myAlertsCommand = require("./commands/myAlerts");
const clearAlertsCommand = require("./commands/clearAlerts"); // Add this line

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});

// Function to start listening for a specific contract
function startListeningForContract(contractAddress, botInstance) {
    console.log(`Starting to listen for contract: ${contractAddress}`);
}

// Register commands properly
bot.command('addalert', (ctx) => {
    addAlertCommand(ctx, bot, startListeningForContract);
});

bot.command('deletealert', (ctx) => {
    deleteAlertCommand(ctx, bot);
});

bot.command('myalerts', (ctx) => {
    myAlertsCommand(ctx, bot);
});

// Add the clear command
bot.command('clearall', (ctx) => {
    clearAlertsCommand(ctx, bot);
});

// Start transfer listeners after DB connection
startTransferListeners();

// Launch Telegram bot
bot.launch();
console.log("🚀 Bot server running...");

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
