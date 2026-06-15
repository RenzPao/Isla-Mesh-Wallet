import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { Platform } from "react-native";

import schema from "./schema";
import Account from "./models/Account";
import Transaction from "./models/Transaction";

const adapter = Platform.select({
  native: new SQLiteAdapter({
    schema,
    dbName: "isla_mesh_wallet",
    jsDebug: false,
  }),
  default: new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
  }),
});

export const database = new Database({
  adapter,
  modelClasses: [Account, Transaction],
});
