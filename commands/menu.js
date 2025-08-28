module.exports = async function menuCommand(ctx) {
    
    const menuMessage = 
`<b>Welcome to the Smart Alert Bot!</b> 🤖

Here's a quick guide to what you can do.

<b>- Advanced Wallet Tracking -</b>
/trackfullwallet - Track any wallet's full activity with a name.
/myfullwallets - Show all wallets you are fully tracking.
/untrackfullwallet - Stop tracking a wallet by its name.
/clearfullwallets - Stop tracking all wallets.

<b>- Specific Token & Sell Alerts -</b>
/trackwalletsell - Alert on specific token sales from a wallet.
/mywalletsells - Show your specific wallet-sell alerts.
/untrackwalletsell - Delete a wallet-sell alert by ID.
/addalert - Alert on large transfers of a specific token.
/myalerts - Show your large transfer alerts.
/deletealert - Delete a large transfer alert by ID.

<b>- General -</b>
/help - Show this menu again.`;

    // We now use 'HTML' as the parse_mode.
    await ctx.reply(menuMessage, { parse_mode: 'HTML' });
};