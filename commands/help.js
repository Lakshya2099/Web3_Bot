module.exports = async function helpCommand(ctx) {
  return ctx.reply([
    "🤖 Commands:",
    "/addalert <token_contract> <min_amount> – ERC-20 Transfer alert",
    "/myalerts – list your token alerts",
    "/deletealert <id> – delete a token alert",
    "/editalert <id> <new_amount> – edit a token alert",
    "",
    "/trackwallet <wallet> – start ERC-20 wallet tracking",
    "/mywallets – list tracked wallets",
    "/untrackwallet <id_or_address> – stop tracking a wallet",
  ].join("\n"));
};
