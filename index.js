require("dotenv").config();
const mongoose = require("mongoose");
const bot = require("./config/bot");
const { initializeAllListeners, startListeningForContract } = require("./events/transferListener");
const { startPolling } = require('./services/walletPoller');
const menuCommand = require('./commands/menu');
const addAlertCommand = require("./commands/addAlert");
const deleteAlertCommand = require("./commands/deleteAlert");
const myAlertsCommand = require("./commands/myAlerts");
const clearAlertsCommand = require("./commands/clearAlerts");
const trackWalletSellCommand = require("./commands/trackWalletSell");
const untrackWalletSellCommand = require("./commands/untrackWalletSell");
const myWalletSellsCommand = require("./commands/myWalletSells");
const clearWalletSellsCommand = require("./commands/clearWalletSells");
const trackFullWalletCommand = require('./commands/trackFullWallet');
const untrackFullWalletCommand = require('./commands/untrackFullWallet');
const myFullWalletsCommand = require('./commands/myFullWallets');
const clearFullWalletsCommand = require('./commands/clearFullWallets');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB connected successfully");
    
    initializeAllListeners();
    startPolling();
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});


bot.command('start', menuCommand);
bot.command('menu', menuCommand);
bot.command('help', menuCommand);


bot.command('addalert', (ctx) => {
    addAlertCommand(ctx, bot, startListeningForContract);
});
bot.command('deletealert', deleteAlertCommand);
bot.command('myalerts', myAlertsCommand);
bot.command('clearall', clearAlertsCommand);


bot.command('trackwalletsell', (ctx) => {
    trackWalletSellCommand(ctx, bot, startListeningForContract);
});
bot.command('untrackwalletsell', untrackWalletSellCommand);
bot.command('mywalletsells', myWalletSellsCommand);
bot.command('clearwalletsells', clearWalletSellsCommand);

bot.command('trackfullwallet', trackFullWalletCommand);
bot.command('untrackfullwallet', untrackFullWalletCommand);
bot.command('myfullwallets', myFullWalletsCommand);
bot.command('clearfullwallets', clearFullWalletsCommand);

bot.launch();
console.log("🚀 Bot server running...");


process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));