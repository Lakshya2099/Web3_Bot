const { ethers } = require("ethers");
const provider = require("../config/provider");
const bot = require("../config/bot");
const Alert = require("../models/Alert"); // Your original alert model
const WalletSellAlert = require("../models/WalletSellAlert"); // Our new model

const ERC20_TRANSFER_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const activeListeners = new Map();

/**
 * This single function handles all transfer events from all contracts.
 * It checks for both general alerts and specific wallet-sell alerts.
 */
async function handleTransfer(from, to, value, event) {
    const contractAddress = event.log.address.toLowerCase();
    
    // --- 1. Logic for your NEW Wallet Sell Alerts ---
    const sellAlerts = await WalletSellAlert.find({
        walletAddress: from.toLowerCase(),
        contractAddress: contractAddress,
    });

    for (const alert of sellAlerts) {
        const amountSold = parseFloat(ethers.formatUnits(value, alert.tokenDecimals));
        
        if (amountSold >= alert.threshold) {
            const message = `🚨 <b>Wallet Sell Alert!</b>\n\n` +
                            `A wallet you are tracking has sold tokens.\n\n` +
                            `<b>From</b>: <code>${from}</code>\n` +
                            `<b>To</b>: <code>${to}</code>\n` +
                            `<b>Amount</b>: ${amountSold.toFixed(4)} ${alert.tokenSymbol}`;
            
            bot.telegram.sendMessage(alert.userId, message, { parse_mode: "HTML" })
                .catch(err => console.error(`Failed to send sell alert to ${alert.userId}:`, err.message));
        }
    }

    // --- 2. Logic for your ORIGINAL general transfer alerts ---
    const generalAlerts = await Alert.find({ contract: contractAddress });

    for (const alert of generalAlerts) {
        const amountTransferred = parseFloat(ethers.formatUnits(value, alert.tokenDecimals));

        if (amountTransferred > alert.threshold) {
             const message = `🚨 <b>Large Transfer Alert!</b>\n\n` +
                            `<b>Token</b>: ${alert.tokenSymbol}\n` +
                            `<b>Amount</b>: ${amountTransferred.toFixed(4)}\n` +
                            `<b>From</b>: <code>${from}</code>\n` +
                            `<b>To</b>: <code>${to}</code>`;
            
            bot.telegram.sendMessage(alert.userId, message, { parse_mode: "HTML" })
                .catch(err => console.error(`Failed to send general alert to ${alert.userId}:`, err.message));
        }
    }
}

/**
 * Starts a listener for a given contract address if one isn't active already.
 * This is called by command handlers when a new alert is added.
 */
function startListeningForContract(contractAddress) {
    const address = contractAddress.toLowerCase();
    if (activeListeners.has(address)) {
        // console.log(`Already listening to ${address}.`);
        return;
    }

    console.log(`🎧 Starting new listener for token: ${address}`);
    const contract = new ethers.Contract(address, ERC20_TRANSFER_ABI, provider);
    
    contract.on('Transfer', handleTransfer);
    
    activeListeners.set(address, contract);
}

/**
 * Scans the database on startup and initializes listeners for all unique contracts
 * from both alert collections.
 */
async function initializeAllListeners() {
    console.log("👂 Initializing listeners for all existing alerts in DB...");
    try {
        const walletAlertContracts = await WalletSellAlert.distinct('contractAddress');
        const generalAlertContracts = await Alert.distinct('contract');
        
        const allContracts = [...new Set([...walletAlertContracts, ...generalAlertContracts])];

        for (const contractAddress of allContracts) {
            if(ethers.isAddress(contractAddress)) {
                startListeningForContract(contractAddress);
            }
        }
        console.log(`✅ Initialization complete. Listening to ${activeListeners.size} unique contracts.`);

    } catch (error) {
        console.error("❌ Failed to initialize listeners from DB:", error);
    }
}

module.exports = { initializeAllListeners, startListeningForContract };