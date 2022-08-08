import type { Types } from "mongoose";
import { Account, NativeAccount, OAuthedAccount } from "server/models";
import { TagController } from "server/controllers";
import { compareArrays, MONGO_DB_ID_REGEX } from "server/utils";
import {
  Account as AccountInterface,
  DehydratedAccount,
  AddAccount,
  UpdateAccount,
  Tag,
} from "types";

export class AccountController {
  public static async createMine(
    data: AddAccount,
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">> {
    const currentDate = new Date();
    const insertionData = {
      ...data,
      user: userId,
      lastUsed: null,
      lastPasswordUpdate: currentDate,
    };

    let account: DehydratedAccount<"Native" | "OAuthed"> & {
      _id: Types.ObjectId;
    };

    if (data.kind === "OAuthed")
      account = await OAuthedAccount.create(insertionData);
    else account = await NativeAccount.create(insertionData);
    return this.populate(account, userId);
  }

  public static async getAllMine(
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">[]> {
    const accounts = await Account.find({ user: userId });
    return this.populateAndSort(accounts, userId);
  }

  public static async getMineWithTag(
    tagId: string,
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">[]> {
    const accounts = await Account.find({ user: userId, tags: tagId });
    return this.populateAndSort(accounts, userId);
  }

  public static async getOneMine(
    id: string,
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">> {
    const account = await Account.findOne({ _id: id, user: userId });
    if (!account)
      throw createError({
        message: "Can't find the account.",
        statusCode: 404,
      });
    return this.populate(account, userId);
  }

  private static getMyAccountTags(
    tags: string[],
    userId: string,
  ): Promise<Tag[]> | Tag[] {
    if (tags && tags.length > 0)
      return TagController.populateTags(tags, userId);
    return [];
  }

  public static async updateLastUsed(id: string, userId: string) {
    const account = await Account.findOne({ _id: id, user: userId });
    if (!account)
      throw createError({
        message: "Can't find the account to update last used.",
        statusCode: 404,
      });
    await Account.findOneAndUpdate(
      { _id: id, user: userId },
      { lastUsed: new Date() },
    );
    return true;
  }

  public static async updateOneMine(
    id: string,
    { app, password, accountIdentifier, note, site, tags, kind }: UpdateAccount,
    userId: string,
  ) {
    const originalDoc = await Account.findOne({ _id: id, user: userId });
    if (!originalDoc)
      throw createError({
        message: "Can't find the account to update.",
        statusCode: 404,
      });

    const fieldsToUpdate: Partial<UpdateAccount> & {
      lastPasswordUpdate?: Date;
    } = {};
    const currentDate = new Date();

    // Check updating the password
    if (password) {
      // Set the original password
      const originalPassword = originalDoc.password;

      // Update if it's new password
      if (password !== originalPassword) {
        // If native add it directly
        if (kind === "Native") {
          fieldsToUpdate.password = password;
          fieldsToUpdate.kind = "Native";
        } else {
          // Making sure it's a valid password id to update to
          if (!password.match(MONGO_DB_ID_REGEX))
            throw createError({
              message: "Can't update the password with invalid password id",
              statusCode: 400,
            });
          // Make sure it's not the current password id
          if (password === id)
            throw createError({
              message: "Can't update the password to the current password",
              statusCode: 400,
            });
          // Make sure it exists
          const passwordToUpdateTo = await Account.findOne({
            _id: password,
            user: userId,
          });
          if (!passwordToUpdateTo)
            throw createError({
              message: "Can't find the password you want to update to",
              statusCode: 400,
            });
          // Make sure it's not a password that points to the current password
          // nor one of it's references
          const optimizedPasswordToUpdateTo = await this.getOneMine(
            password,
            userId,
          );
          let currPass: AccountInterface<"Native"> | string =
            optimizedPasswordToUpdateTo.password;
          while (typeof currPass !== "string") {
            if (currPass._id.toString() === id)
              throw createError({
                message:
                  "Can't update the password to a password that points to the current one or one of it's references points to the current one",
                statusCode: 400,
              });
            currPass = currPass.password;
          }

          fieldsToUpdate.password = password;
          fieldsToUpdate.kind = "OAuthed";
        }
        // Update password's last update date
        if (Object.hasOwn(fieldsToUpdate, "password"))
          fieldsToUpdate.lastPasswordUpdate = currentDate;
      }
    }

    // Check updating other fields
    if (app && app.length >= 3 && app !== originalDoc.app)
      fieldsToUpdate.app = app;
    if (site !== undefined && site !== originalDoc.site)
      fieldsToUpdate.site = site;
    if (note !== undefined && note !== originalDoc.note)
      fieldsToUpdate.note = note;
    if (
      accountIdentifier !== undefined &&
      accountIdentifier !== originalDoc.accountIdentifier
    )
      fieldsToUpdate.accountIdentifier = accountIdentifier;
    if (
      tags !== undefined &&
      originalDoc.tags &&
      !compareArrays(
        tags,
        originalDoc.tags.map(t => t.toString()),
      )
    )
      fieldsToUpdate.tags = tags;

    // Return without saving if nothing to change
    if (Object.keys(fieldsToUpdate).length === 0)
      return this.populate(originalDoc, userId);

    const newAccount = await Account.findOneAndUpdate(
      { _id: id, user: userId },
      fieldsToUpdate,
    );
    if (!newAccount)
      throw createError({
        message: "Can't find the account to update.",
        statusCode: 404,
      });
    return this.populate(newAccount, userId);
  }

  public static async removeTagFromAccounts(tagId: string, userId: string) {
    const accounts = await Account.find({ user: userId, tags: tagId });
    await Promise.all(
      accounts
        .filter(a => a.tags && a.tags.length > 0)
        .map(async account => {
          const newTags = account.tags!.filter(tag => tag.toString() !== tagId);
          await Account.findByIdAndUpdate(account.id, { tags: newTags });
        }),
    );
    return true;
  }

  public static async removeOneMine(id: string, userId: string) {
    const account = await Account.findOne({ _id: id, user: userId });
    if (!account)
      throw createError({
        message: "Can't find the account to delete.",
        statusCode: 404,
      });
    // Make sure the account to delete doesn't have any passwords that
    // point the the current one
    const oAuthedByAccountToDelete = await OAuthedAccount.find({
      password: id,
    });
    if (oAuthedByAccountToDelete.length > 0)
      throw createError({
        message:
          "You can't delete this account because it has password(s) that point to it",
      });
    await Account.deleteOne({ _id: id, user: userId });
    return true;
  }

  private static async populate(
    doc: DehydratedAccount<"Native" | "OAuthed"> & { _id: Types.ObjectId },
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">> {
    const result: Record<string, unknown> = { ...doc };
    if (doc.kind === "OAuthed")
      result.password = (await this.getOneMine(
        doc.password.toString(),
        userId,
      )) as AccountInterface<"Native">;
    result.tags =
      doc.tags &&
      (await this.getMyAccountTags(
        doc.tags.map(t => t.toString()) || [],
        userId,
      ));
    return result as AccountInterface<"Native" | "OAuthed">;
  }

  private static async populateAndSort(
    docs: (DehydratedAccount<"Native" | "OAuthed"> & { _id: Types.ObjectId })[],
    userId: string,
  ): Promise<AccountInterface<"Native" | "OAuthed">[]> {
    const populated = await Promise.all(
      docs.map(x => this.populate(x, userId)),
    );
    const sorted = this.sort(populated);
    return sorted;
  }

  private static sort<
    TKind extends "Native" | "OAuthed" | undefined,
    TAccount extends AccountInterface<TKind> = AccountInterface<TKind>,
  >(docs: TAccount[]): TAccount[] {
    return docs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }
}
