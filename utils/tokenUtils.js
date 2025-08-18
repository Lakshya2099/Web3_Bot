const { ethers } = require("ethers");
const provider = require("../config/provider");

const ERC20_META_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

async function fetchTokenMeta(address) {
  try {
    const code = await provider.getCode(address);
    if (code === '0x') {
      console.warn(`No contract found at address: ${address}`);
      return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
    }

    const contract = new ethers.Contract(address, ERC20_META_ABI, provider);
    let name = "Unknown Token";
    let symbol = "UNKNOWN";
    let decimals = 18;

    try { name = await contract.name(); } catch (e) { console.warn(`Could not fetch name for ${address}`); }
    try { symbol = await contract.symbol(); } catch (e) { console.warn(`Could not fetch symbol for ${address}`); }
    try {
      const d = await contract.decimals();
      decimals = Number(d);
    } catch (e) { console.warn(`Could not fetch decimals for ${address}`); }
    
    return { name, symbol, decimals };
  } catch (error) {
    console.error(`Error in fetchTokenMeta for ${address}:`, error.message);
    return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
  }
}

module.exports = { fetchTokenMeta };



