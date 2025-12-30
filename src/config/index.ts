import { createConfig, http } from "wagmi";
import { activeChains } from "./chains";
import { injected } from "wagmi/connectors";
import { xoConnector } from "@/wagmi/xoConnector";
import { IS_EMBEDDED } from "./app";

// miniapps
const connectors = IS_EMBEDDED ? [xoConnector()] : [injected()];

const transports = Object.fromEntries(
  activeChains.map((chain) => [chain.id, http()]),
);

export const config = createConfig({
  chains: activeChains,
  transports,
  connectors,
  ssr: true,
});
