import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Account extends Model {
  static table = "accounts";

  @field("public_key") publicKey!: string;
  @field("encrypted_secret") encryptedSecret!: string;
  @field("last_balance") lastBalance!: string;
  @field("last_sequence") lastSequence!: string;
  @readonly @date("created_at") createdAt!: number;
}
