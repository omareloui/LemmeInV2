import {
  User as UserType,
  UpdateUserOptions,
  CreateUserOptions,
  UpdateMeOptions,
} from "../@types/index.ts";

import { createRegex } from "../utils/index.ts";
import { CollectionHelper, HashHelper, ErrorHelper } from "../helpers/index.ts";

import { User, UserSchema, UserHistory } from "../models/index.ts";
import { BaseService } from "./index.ts";

const UserHelper = new CollectionHelper(User);
const UserHistoryHelper = new CollectionHelper(UserHistory);

const userErrorHelper = new ErrorHelper("user");

export class UserService extends BaseService {
  public static async create(options: CreateUserOptions) {
    const { firstName, lastName, email, password, role } = options;

    // Making sure the email is unique
    const emailRegex = createRegex(email, { i: true, exactMatch: true });
    const sameEmailUser = await UserHelper.findOne({ email: emailRegex });
    if (sameEmailUser)
      return userErrorHelper.badRequest({
        message: "This email is already in use. Try signing in instead.",
      });

    const hashedPassword = await HashHelper.hash(password);
    const currentDate = new Date();

    const userData: Omit<UserSchema, "_id"> = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
      isValidEmail: false,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    // Create the user
    const user = await UserHelper.createOne(userData);
    if (!user) return userErrorHelper.badRequest({ action: "create" });
    const userId = user.id.toString();
    // Create the user history first entry
    await UserHistoryHelper.createOne({
      userId,
      ...userData,
      isDisabled: false,
      version: 1,
    });
    return user as UserType;
  }

  public static getAll(): Promise<UserType[]> {
    return UserHelper.find() as Promise<UserType[]>;
  }

  public static async getOne(id: string): Promise<UserType> {
    const user = await UserHelper.findById(id);
    if (!user) return userErrorHelper.notFound();
    delete (user as { password?: string }).password;
    return user as UserType;
  }

  public static async updateOne(id: string, options: UpdateUserOptions) {
    const user = await UserHelper.findById(id);
    if (!user) return userErrorHelper.notFound();
    const newestUserHistory = await this.getNewestUserHistory(id);
    const newVersionNumber = newestUserHistory.version + 1;
    const updateFields: Omit<UpdateUserOptions, "oldPassword"> = {};
    const currentDate = new Date();

    // Set the fields to update
    // they'll be used in eval
    // deno-lint-ignore no-unused-vars
    const { firstName, lastName, email, password, oldPassword, role } = options;
    if (password && oldPassword) {
      const isValidOldPassword = await HashHelper.compare(
        oldPassword,
        user.password,
      );
      if (!isValidOldPassword)
        await userErrorHelper.badRequest({
          message: "The old password is not valid",
        });
      updateFields.password = await HashHelper.hash(password);
    }
    function addToUpdateFields(
      fieldName: keyof Omit<UpdateUserOptions, "oldPassword">,
    ) {
      const fieldValue = eval(fieldName);
      if (fieldValue && fieldValue !== user![fieldName])
        updateFields[fieldName] = fieldValue;
    }
    const fieldsToUpdate = new Set([
      "firstName",
      "lastName",
      "email",
      "role",
    ]) as Set<keyof Omit<UpdateUserOptions, "oldPassword">>;
    [...fieldsToUpdate].forEach(x => addToUpdateFields(x));

    // Return if it doesn't need updating
    const hasToUpdate = Object.keys(updateFields).length > 0;
    if (!hasToUpdate) return user as UserType;

    // Update the user
    updateFields.updatedAt = currentDate;
    const newUser = await UserHelper.updateById(id, updateFields);
    if (!newUser) return userErrorHelper.notFound();

    // Create the history record
    const updateUserClone = { ...newUser };
    delete (updateUserClone as { id?: string }).id;
    await UserHistoryHelper.createOne({
      ...updateUserClone,
      userId: id,
      isDisabled: false,
      version: newVersionNumber,
    });
    return newUser as UserType;
  }

  public static updateMe(options: UpdateMeOptions, userId: string) {
    return this.updateOne(userId, options);
  }

  public static async removeOne(id: string) {
    // Get the user to delete
    const user = await UserHelper.findById(id);
    if (!user) return userErrorHelper.notFound();
    // Delete the user
    await UserHelper.deleteById(id);
    // Set the user's history
    const newestUserHistory = await this.getNewestUserHistory(id);
    const newVersion = newestUserHistory.version + 1;
    delete (user as { id?: string }).id;
    await UserHistoryHelper.createOne({
      ...user,
      userId: id,
      isDisabled: true,
      updatedAt: new Date(),
      version: newVersion,
    });
    return true;
  }

  public static async getUserHistory(userId: string) {
    const userHistory = await UserHistoryHelper.find({ userId });
    if (userHistory.length === 0)
      return userErrorHelper.notFound({ message: "Can't find user history" });
    const sortedHistory = userHistory.sort((a, b) => a.version - b.version);
    return sortedHistory;
  }

  private static async getNewestUserHistory(userId: string) {
    const userHistory = await this.getUserHistory(userId);
    const newestUserHistory = userHistory.at(-1);
    if (!newestUserHistory) return userErrorHelper.notFound();
    return newestUserHistory;
  }
}
