import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import Account from "./models/Account";
import Transaction from "./models/Transaction";

const adapter = new SQLiteAdapter({
  schema,
  dbName: "isla_mesh_wallet",
  jsDebug: false,
});

export const database = new Database({
  adapter,
  modelClasses: [Account, Transaction],
});
