import mongoose from "mongoose";
import type { DehydratedAccount } from "types";

const { Schema, model } = mongoose;

const options = { timestamps: true, discriminatorKey: "kind" };

const AccountSchema = new Schema<DehydratedAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    app: { type: String, required: true },
    accountIdentifier: { type: String },
    note: { type: String },
    site: { type: String },
    lastPasswordUpdate: { type: Date },
    lastUsed: { type: Date },
    tags: { type: [Schema.Types.ObjectId], ref: "Tag" },
  },
  options,
);

export const Account = model<DehydratedAccount>("Account", AccountSchema);

export const NativeAccount = Account.discriminator<DehydratedAccount<"Native">>(
  "Native",
  new Schema<DehydratedAccount<"Native">>(
    { password: { type: String, required: true } },
    options,
  ),
);
export const OAuthedAccount = Account.discriminator(
  "OAuthed",
  new Schema<DehydratedAccount<"OAuthed">>({
    password: {
      type: Schema.Types.ObjectId,
      ref: "AccountSchema",
      required: true,
    },
  }),
);
