import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Transaction extends Model {
  static table = "transactions";

  @field("sender_public_key") senderPublicKey!: string;
  @field("receiver_public_key") receiverPublicKey!: string;
  @field("amount") amount!: string;
  @field("xdr") xdr!: string;
  @field("status") status!: string;
  @field("error") error?: string;
  @readonly @date("created_at") createdAt!: number;
}
