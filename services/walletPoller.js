const axios = require('axios');
const { ethers } = require('ethers');
const TrackedFullWallet = require('../models/TrackedFullWallet');
const bot = require('../config/bot');

const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

// A list of keywords commonly found in scam token names
const SCAM_KEYWORDS = ['.com', '.net', '.io', 'claim', 'airdrop', 'free', 'giveaway', 'reward', 'support', 'gift', 'www.', 'http'];

// A helper function to check for scam keywords
function isLikelyScam(tokenName) {
    if (!tokenName) return false;
    const lowerCaseName = tokenName.toLowerCase();
    return SCAM_KEYWORDS.some(keyword => lowerCaseName.includes(keyword));
}

function formatTransaction(tx, trackedAddress) {
    if (isLikelyScam(tx.asset)) {
        return `⚠️ **Potential Scam Detected!**\n\n` +
               `**Token:** \`${tx.asset}\`\n\n` +
               `This token's name contains suspicious keywords. This is a common tactic for phishing scams.\n\n` +
               `**ACTION:** Do not visit any websites in the token name or interact with this token.`;
    }

    if (!tx.asset || tx.asset.toLowerCase() === 'null') {
        return null;
    }

    const value = ethers.formatUnits(BigInt(tx.rawContract.value || 0), Number(tx.rawContract.decimal || 18));
    const formattedValue = parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 4 });
    const isSender = tx.from.toLowerCase() === trackedAddress.toLowerCase();
    
    const direction = isSender ? '➡️ Sent' : '⬅️ Received';
    const emoji = isSender ? '💸' : '💰';
    const toFrom = isSender ? `To: <code>${tx.to}</code>` : `From: <code>${tx.from}</code>`;

    return `${emoji} **${direction} ${formattedValue} <code>${tx.asset}</code>**\n${toFrom}\n<a href="https://etherscan.io/tx/${tx.hash}">Etherscan Link</a>`;
}

async function checkWallets() {
    const wallets = await TrackedFullWallet.find({});
    for (const wallet of wallets) {
        try {
            const response = await axios.post(ALCHEMY_URL, {
                jsonrpc: "2.0",
                id: 1,
                method: "alchemy_getAssetTransfers",
                params: [{
                    fromBlock: "0x0",
                    fromAddress: wallet.walletAddress,
                    category: ["external", "internal", "erc20"],
                    withMetadata: true,
                    excludeZeroValue: true,
                    maxCount: "0x19",
                    order: "desc"
                }]
            });
            
            const transactions = response.data.result.transfers;
            if (!transactions || transactions.length === 0) continue;

            transactions.reverse();

            const lastTxIndex = wallet.lastTxHash 
                ? transactions.findIndex(tx => tx.hash === wallet.lastTxHash) 
                : -1;
                
            const newTransactions = transactions.slice(lastTxIndex + 1);

            if (newTransactions.length > 0) {
                for (const tx of newTransactions) {
                    const formattedMessage = formatTransaction(tx, wallet.walletAddress);
                    
                    if (formattedMessage) {
                        const header = `🔔 **New Activity for** <code>${wallet.walletAddress}</code>`;
                        await bot.telegram.sendMessage(wallet.userId, `${header}\n\n${formattedMessage}`, { parse_mode: 'HTML', disable_web_page_preview: true });
                        await new Promise(resolve => setTimeout(resolve, 500)); 
                    }
                }
                
                // --- THIS IS THE FIX ---
                // Instead of wallet.save(), we do a direct update.
                // This is safer and avoids the race condition error.
                const latestHash = newTransactions[newTransactions.length - 1].hash;
                await TrackedFullWallet.updateOne(
                    { _id: wallet._id },
                    { $set: { lastTxHash: latestHash } }
                );
            }
        } catch (error) {
            console.error(`Failed to poll wallet ${wallet.walletAddress}:`, error.message || (error.response ? error.response.data : error));
        }
    }
}

function startPolling() {
    console.log('🚀 Starting Advanced Wallet Polling Service...');
    checkWallets();
    setInterval(checkWallets, 20000); 
}

module.exports = { startPolling };