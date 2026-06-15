import { Horizon } from "@stellar/stellar-sdk";
import { getPendingTransactions } from "../db/transactionHelpers";
import { database } from "../db";
import Transaction from "../db/models/Transaction";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * RELAY ENGINE
 * Monitors the outbox and submits transactions to the Stellar network when online.
 */
export const syncTransactions = async () => {
  const pending = await getPendingTransactions();
  
  if (pending.length === 0) return;

  console.log(`Relay: Attempting to sync ${pending.length} transactions...`);

  for (const tx of pending) {
    if (tx.status !== "pending_sync") continue;

    try {
      // Submit the Base64 XDR string to Horizon
      const response = await server.submitTransaction(tx.xdr);
      console.log(`Relay: Success! Tx settled: ${response.hash}`);

      // Update local state to "settled"
      await database.write(async () => {
        await tx.update((t) => {
          t.status = "settled";
        });
      });
    } catch (e: any) {
      console.error(`Relay: Failed for tx ${tx.id}:`, e);
      
      // If it's a permanent error (e.g. bad signature), mark as failed.
      // If it's a temporary error (e.g. timeout), we might want to retry later.
      // For this MVP, we'll mark as failed if it doesn't succeed.
      await database.write(async () => {
        await tx.update((t) => {
          t.status = "failed";
          t.error = e.response?.data?.extras?.result_codes?.transaction || e.message;
        });
      });
    }
  }
};
