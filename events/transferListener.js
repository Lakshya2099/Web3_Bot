// events/transferListener.js
const { ethers } = require("ethers");
const Alert = require("../models/Alert");
const { getTokenDetails } = require("../utils/tokenUtils");
const provider = require("../config/provider");
const bot = require("../config/bot");

async function startTransferListeners() {
    console.log("👂 Starting Transfer listeners for all alerts...");

    // Filter out invalid alerts from the database query
    const alerts = await Alert.find({
        contract: { 
            $exists: true, 
            $ne: null, 
            $ne: undefined, 
            $ne: "" 
        }
    });

    console.log(`Found ${alerts.length} valid alerts`);

    const tokenMap = {};

    alerts.forEach(alert => {
        // Additional validation - ensure contract address is valid
        if (alert.contract && ethers.isAddress(alert.contract)) {
            if (!tokenMap[alert.contract]) {
                tokenMap[alert.contract] = [];
            }
            tokenMap[alert.contract].push(alert);
        } else {
            console.warn(`Skipping invalid contract address: ${alert.contract} for alert ID: ${alert._id}`);
        }
    });

    console.log(`Setting up listeners for ${Object.keys(tokenMap).length} unique tokens`);

    for (const tokenAddress of Object.keys(tokenMap)) {
        try {
            // Validate address before processing
            if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
                console.warn(`Skipping invalid token address: ${tokenAddress}`);
                continue;
            }

            const alertsForToken = tokenMap[tokenAddress];
            const { symbol, decimals } = await getTokenDetails(provider, tokenAddress);

            console.log(`✅ Listening to transfers for ${tokenAddress} (${symbol})`);

            const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
            const contract = new ethers.Contract(tokenAddress, abi, provider);

            contract.on("Transfer", async (from, to, value) => {
                try {
                    const humanAmount = parseFloat(ethers.formatUnits(value, decimals));

                    for (const alert of alertsForToken) {
                        if (humanAmount > alert.threshold) {
                            console.log(
                                `🚨 ${symbol} transfer detected: ${humanAmount} from ${from} to ${to} (Threshold: ${alert.threshold})`
                            );

                            try {
                                await bot.telegram.sendMessage(alert.userId, 
                                    `🚨 Transfer Alert!\n` +
                                    `Token: ${symbol}\n` +
                                    `Amount: ${humanAmount}\n` +
                                    `From: ${from}\n` +
                                    `To: ${to}`
                                );
                            } catch (err) {
                                if (err?.response?.error_code === 403) {
                                    console.warn(`⚠️ User ${alert.userId} blocked the bot. Deleting their alerts.`);
                                    await Alert.deleteMany({ userId: alert.userId });
                                } else {
                                    console.error(`❌ Failed to send Telegram alert:`, err);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error processing transfer event for ${symbol}:`, err);
                }
            });
        } catch (error) {
            console.error(`❌ Error setting up listener for ${tokenAddress}:`, error.message);
        }
    }
}

module.exports = { startTransferListeners };
