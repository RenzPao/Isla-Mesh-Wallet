import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "accounts",
      columns: [
        { name: "public_key", type: "string", isIndexed: true },
        { name: "encrypted_secret", type: "string" },
        { name: "last_balance", type: "string" },
        { name: "last_sequence", type: "string" },
        { name: "created_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "transactions",
      columns: [
        { name: "sender_public_key", type: "string", isIndexed: true },
        { name: "receiver_public_key", type: "string" },
        { name: "amount", type: "string" },
        { name: "xdr", type: "string" },
        { name: "status", type: "string", isIndexed: true }, // pending_sync, settled, failed
        { name: "error", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
      ],
    }),
  ],
});
