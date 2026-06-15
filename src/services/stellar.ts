import {
  Keypair,
  Asset,
  TransactionBuilder,
  Account as StellarAccount,
  Operation,
  Networks,
  BASE_FEE,
  Transaction,
} from "@stellar/stellar-sdk";

// Circle's Testnet USDC Issuer
export const USDC_ASSET = new Asset(
  "USDC",
  "GBBD67V7GRG7X3L7O3S7Z6L6XCCRV6Y2L3S4X3L7O3S7Z6L6XCCRV6Y2L"
);

export const generateKeypair = () => {
  return Keypair.random();
};

export const createOfflinePaymentXDR = async (
  senderSecret: string,
  receiverPublicKey: string,
  amount: string,
  sequenceNumber: string,
  networkPassphrase: string = Networks.TESTNET
) => {
  const senderKeypair = Keypair.fromSecret(senderSecret);
  const senderPublicKey = senderKeypair.publicKey();

  // We construct a "virtual" account for the sender using the sequence number from our local cache
  const sourceAccount = new StellarAccount(senderPublicKey, sequenceNumber);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
    timebounds: { minTime: 0, maxTime: 0 }, // No timebounds for offline transactions to ensure flexibility
  })
    .addOperation(
      Operation.payment({
        destination: receiverPublicKey,
        asset: USDC_ASSET,
        amount: amount,
      })
    )
    .setTimeout(0)
    .build();

  transaction.sign(senderKeypair);

  return transaction.toXDR();
};

export const getPublicKeyFromSecret = (secret: string) => {
  try {
    return Keypair.fromSecret(secret).publicKey();
  } catch (e) {
    return null;
  }
};
