import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("Slice Protocol", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, claimer, defender] = await viem.getWalletClients();

  // Helper to deploy a fresh setup
  async function deployFixture() {
    const token = await viem.deployContract("MockUSDC");
    const slice = await viem.deployContract("Slice", [token.address]);
    return { token, slice };
  }

  it("Should emit DisputeCreated when creating a dispute", async function () {
    const { slice } = await deployFixture();

    // Simulate Claimer creating a dispute against Defender
    const tx = slice.write.createDispute(
      [
        {
          defender: defender.account.address,
          category: "Freelance",
          ipfsHash: "QmHash123",
          jurorsRequired: 3n,
          paySeconds: 86400n,
          commitSeconds: 86400n,
          revealSeconds: 86400n,
        },
      ],
      { account: claimer.account },
    );

    // Assert the event was emitted
    await viem.assertions.emitWithArgs(tx, slice, "DisputeCreated", [
      1n,
      getAddress(claimer.account.address), // Fix: Normalized Checksum Address
      getAddress(defender.account.address), // Fix: Normalized Checksum Address
    ]);
  });

  it("Should allow a user to Pay (Deposit) and emit FundsDeposited", async function () {
    const { token, slice } = await deployFixture();

    // 1. Create the dispute first
    await slice.write.createDispute(
      [
        {
          defender: defender.account.address,
          category: "Test",
          ipfsHash: "QmHash",
          jurorsRequired: 1n,
          paySeconds: 1000n,
          commitSeconds: 1000n,
          revealSeconds: 1000n,
        },
      ],
      { account: claimer.account },
    );

    // 2. Setup Tokens for the Claimer
    const requiredStake = 100000n;
    await token.write.mint([claimer.account.address, requiredStake]);
    await token.write.approve([slice.address, requiredStake], {
      account: claimer.account,
    });

    // 3. Pay
    await viem.assertions.emitWithArgs(
      slice.write.payDispute([1n], { account: claimer.account }),
      slice,
      "FundsDeposited",
      [1n, getAddress(claimer.account.address), requiredStake],
    );

    // 4. Verify state
    const disputeData = await slice.read.disputes([1n]);

    // FIX: Use dot notation instead of array index
    const claimerPaid = disputeData.claimerPaid;

    assert.equal(claimerPaid, true, "Claimer should be marked as paid");
  });
});
