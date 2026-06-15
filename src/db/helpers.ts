import { database } from "../db";
import Account from "../db/models/Account";

export const getActiveAccount = async (): Promise<Account | null> => {
  const accounts = await database.get<Account>("accounts").query().fetch();
  return accounts.length > 0 ? accounts[0] : null;
};

export const createAccount = async (publicKey: string, secret: string) => {
  await database.write(async () => {
    await database.get<Account>("accounts").create((account) => {
      account.publicKey = publicKey;
      account.encryptedSecret = secret; // In a real app, this should be encrypted
      account.lastBalance = "0";
      account.lastSequence = "0";
    });
  });
};

export const updateAccountBalance = async (
  account: Account,
  balance: string,
  sequence: string
) => {
  await database.write(async () => {
    await account.update((acc) => {
      acc.lastBalance = balance;
      acc.lastSequence = sequence;
    });
  });
};
