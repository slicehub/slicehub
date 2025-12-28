// === Privy
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!;
export const PRIVY_JWKS_ENDPOINT = process.env.NEXT_PUBLIC_PRIVY_JWKS_ENDPOINT!;
export const PRIVY_SECRET = process.env.PRIVY_SECRET!;

// === Pinata
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
export const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET!;
export const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!;
export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
export const PINATA_GROUP_ID = process.env.NEXT_PUBLIC_PINATA_GROUP_ID!;

// === Environment / Mode
export const IS_EMBEDDED = process.env.NEXT_PUBLIC_IS_EMBEDDED === "true";
