// 1. Define Types
type ChainDetail = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: readonly string[];
  blockExplorerUrls: readonly string[];
  iconUrls: readonly string[];
};



type ChainConfig = {
  chainId: number;
  rpcUrls: { [key: number]: string };
  supportedChains: readonly [ChainDetail];
};

export type SettingsType = {
  apiDomain: string;
  environment: "development" | "staging" | "production";
  chain: ChainConfig;
};

// Define Base Sepolia (Testnet)
const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  rpcUrls: { 84532: "https://sepolia.base.org" },
  supportedChains: [
    {
      chainId: "0x14a34", // Hex for 84532
      chainName: "Base Sepolia",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://sepolia.base.org"],
      blockExplorerUrls: ["https://sepolia.basescan.org"],
      iconUrls: ["https://avatars.githubusercontent.com/u/108554348?s=200&v=4"],
    },
  ],
} as const;

// Define Base Mainnet
const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  rpcUrls: { 8453: "https://mainnet.base.org" },
  supportedChains: [
    {
      chainId: "0x2105", // Hex for 8453
      chainName: "Base",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://mainnet.base.org"],
      blockExplorerUrls: ["https://basescan.org"],
      iconUrls: ["https://avatars.githubusercontent.com/u/108554348?s=200&v=4"],
    },
  ],
} as const;

// Update Environments
const development: SettingsType = {
  apiDomain: "http://localhost:5001",
  environment: "development",
  chain: BASE_SEPOLIA_CONFIG,
};

const staging: SettingsType = {
  apiDomain: "https://staging-api.slicehub.com",
  environment: "staging",
  chain: BASE_SEPOLIA_CONFIG,
};

const production: SettingsType = {
  apiDomain: "https://api.slicehub.com",
  environment: "production",
  chain: BASE_MAINNET_CONFIG,
};

// 5. Export Config based on Environment Variable
const env = (process.env.NEXT_PUBLIC_APP_ENV ||
  process.env.NODE_ENV ||
  "development") as keyof typeof configs;

const configs = {
  development,
  staging,
  production,
};

export const settings: SettingsType = configs[env] || configs.development;
