const { Contract } = require("ethers");

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

async function getTokenDetails(provider, address) {
  try {
    // Validate that the address is properly formatted
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
      console.warn(`Invalid address format: ${address}`);
      return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
    }

    const token = new Contract(address, ERC20_ABI, provider);
    
    // Check if contract exists by trying to get code
    const code = await provider.getCode(address);
    if (code === '0x') {
      console.warn(`No contract found at address: ${address}`);
      return { name: "Unknown Token", symbol: "UNKNOWN", decimals: 18 };
    }

    // Try to fetch token details with individual error handling
    let name = "Unknown Token";
    let symbol = "UNKNOWN";
    let decimals = 18;

    try {
      name = await token.name();
    } catch (e) {
      console.warn(`Could not fetch name for ${address}: ${e.message}`);
    }

    try {
      symbol = await token.symbol();
    } catch (e) {
      console.warn(`Could not fetch symbol for ${address}: ${e.message}`);
    }

    try {
      const dec = await token.decimals();
      if (typeof dec === 'number') {
        decimals = dec;
      } else {
        decimals = Number(dec);
      }
    } catch (e) {
      console.warn(`Could not fetch decimals for ${address}: ${e.message}`);
    }

    return { name, symbol, decimals };

  } catch (err) {
    console.error(`❌ Error fetching token details for ${address}:`, err.message);
    
    // Return safe defaults
    return { 
      name: "Unknown Token", 
      symbol: "UNKNOWN", 
      decimals: 18 
    };
  }
}

module.exports = { 
  ERC20_ABI, 
  getTokenDetails,
  getTokenInfo: getTokenDetails // Alias for compatibility
};
