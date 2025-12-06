# ⚖️ Slice Protocol Application

This project is the frontend implementation for **Slice**, a **neutral, on-chain dispute resolution protocol** built on Next.js and integrated with **Reown AppKit** and **Wagmi**.

---

## What is Slice?

**Slice** acts as a decentralized **truth oracle** for applications and smart contracts that require a neutral decision.

It utilizes a juror staking pool, random selection (VRF), and a commit–reveal scheme to ensure hidden, fair, and verifiable voting. The result is a simple, trustless ruling (Party A or Party B) that external protocols can trust and execute upon.

### Core Workflow (On-Chain)

1.  **Create Dispute:** An external contract calls Slice's `createDispute(...)` function.
2.  **Juror Selection:** Slice randomly selects jurors from the staked pool.
3.  **Private Vote:** Jurors submit private commitments (`hash(vote_option + secret)`).
4.  **Reveal:** Jurors reveal their vote and secret to verify their commitment. Only revealed votes are counted.
5.  **Ruling:** Slice aggregates the votes, determines the winner, and publishes the final ruling on-chain.

---

## 🌍 Environment & Connectivity

This application is configured to handle two primary environments and two distinct wallet connection methods based on the `NEXT_PUBLIC_APP_ENV` variable.

### Environment Mapping

The connection chain is determined by the explicit `APP_ENV` setting. If no environment variable is explicitly set, the connection mode defaults to **Web Mode**.

| Environment Variable (`NEXT_PUBLIC_APP_ENV`) | Environment | Chain Used | Connection Mode |
| :--- | :--- | :--- | :--- |
| `production` | Production | **Polygon Mainnet** | **Embedded (XO Connect)** |
| `staging` | Staging | Polygon Amoy (Testnet) | Web (Reown AppKit) |
| `development` (Default) | Development | Polygon Amoy (Testnet) | Web (Reown AppKit) |

### Wallet Connection Modes

| Mode | Triggered By | Wallet Used | Role |
| :--- | :--- | :--- | :--- |
| **Embedded Mode** | `NEXT_PUBLIC_APP_ENV=production` | **XO Connect** | Used when running as a mini-app inside a super-app/wallet container. |
| **Web Mode** | `NEXT_PUBLIC_APP_ENV` ≠ `production` | **Reown AppKit / Wagmi** | Used when running as a standard decentralized application (dApp) in a web browser. |

---

## ⚙️ Usage

1. Go to [Reown Dashboard](https://dashboard.reown.com) and create a new project.
2. Copy your `Project ID`.
3. Rename `.env.example` to `.env.local` and paste your `Project ID` as the value for `NEXT_PUBLIC_PROJECT_ID`.

    ```.env.local
    NEXT_PUBLIC_PROJECT_ID="YOUR_PROJECT_ID"
    # Set the environment (will default to development/Testnet if omitted)
    # NEXT_PUBLIC_APP_ENV=production 
    ```

4. Run `pnpm install` to install dependencies.
5. Run `pnpm run dev` to start the development server.

## Resources

- [Reown — Docs](https://docs.reown.com)
- [Next.js — Docs](https://nextjs.org/docs)
