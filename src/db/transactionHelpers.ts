import { database } from "../db";
import Transaction from "../db/models/Transaction";
import { Transaction as StellarTransaction, Networks } from "@stellar/stellar-sdk";

export const queueReceivedTransaction = async (xdr: string) => {
  try {
    // 1. Decode XDR to extract metadata
    const tx = new StellarTransaction(xdr, Networks.TESTNET);
    const sender = tx.source;
    const op = tx.operations[0];
    
    let amount = "0";
    let receiver = "";
    
    if (op.type === "payment") {
      amount = op.amount;
      receiver = op.destination;
    }

    // 2. Save to database
    await database.write(async () => {
      await database.get<Transaction>("transactions").create((t) => {
        t.senderPublicKey = sender;
        t.receiverPublicKey = receiver;
        t.amount = amount;
        t.xdr = xdr;
        t.status = "pending_sync";
      });
    });
    
    return true;
  } catch (e) {
    console.error("Failed to queue transaction:", e);
    return false;
  }
};

export const getPendingTransactions = async () => {
  return await database
    .get<Transaction>("transactions")
    .query()
    .fetch();
};
