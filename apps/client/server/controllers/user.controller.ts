import type {
  DehydratedUser,
  User as UserInterface,
  CreateUserOptions,
  UpdateUserOptions,
  UpdateMeOptions,
} from "types";
import { createRegex, hash, compareHash } from "server/utils";

import { User, UserHistory } from "server/models";

export class UserController {
  public static async create(
    options: CreateUserOptions,
  ): Promise<UserInterface> {
    const { firstName, lastName, email, password, role } = options;

    // Making sure the email is unique
    const emailRegex = createRegex(email, { i: true, exactMatch: true });
    const sameEmailUser = await User.findOne({ email: emailRegex });
    if (sameEmailUser)
      throw createError({
        message: "This email is already in use. Try signing in instead.",
        statusCode: 409,
      });

    const hashedPassword = await hash(password);

    const userData: DehydratedUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
      isValidEmail: false,
    };

    // Create the user
    const user = (await new User(userData).save()) as UserInterface;
    // Create the user history first entry
    const userId = user.id.toString();
    await UserHistory.create({
      userId,
      ...userData,
      isDisabled: false,
      version: 1,
    });
    return user;
  }

  public static async getAll(): Promise<UserInterface[]> {
    const users = (await User.find({})) as UserInterface[];
    return users;
  }

  public static async getOne(id: string): Promise<UserInterface> {
    const user = (await User.findById(id)) as UserInterface;
    if (!user)
      throw createError({
        message: "Can't find the required user.",
        statusCode: 404,
      });
    return user;
  }

  public static async updateOne(
    id: string,
    options: UpdateUserOptions,
  ): Promise<UserInterface> {
    const user = (await User.findById(id)) as UserInterface | null;
    if (!user)
      throw createError({
        message: "Can't find the user to update.",
        statusCode: 404,
      });
    const updateFields: Omit<UpdateUserOptions, "oldPassword"> = {};

    const { firstName, lastName, email, password, oldPassword, role } = options;

    // Validate password if provided
    if (password && oldPassword) {
      const isValidOldPassword = await compareHash(oldPassword, user.password);
      if (!isValidOldPassword)
        throw createError({
          message: "The old password is not valid",
          statusCode: 400,
        });
      updateFields.password = await hash(password);
    }

    // Populate fields to update
    if (firstName && firstName !== user.firstName)
      updateFields.firstName = firstName;
    if (lastName && lastName !== user.lastName)
      updateFields.lastName = lastName;
    if (email && email !== user.email) updateFields.email = email;
    if (role && role !== user.role) updateFields.role = role;

    // Return if it doesn't need updating
    const hasToUpdate = Object.keys(updateFields).length > 0;
    if (!hasToUpdate) return user;

    // Update the user
    const newUser = (await User.findByIdAndUpdate(
      id,
      updateFields,
    )) as UserInterface;

    // Create the history record
    const updateUserClone = { ...newUser };
    delete (updateUserClone as { _id?: string })._id;
    const newestUserHistory = await this.getNewestUserHistory(id);
    const newVersionNumber = newestUserHistory.version + 1;
    await UserHistory.create({
      ...updateUserClone,
      userId: id,
      isDisabled: false,
      version: newVersionNumber,
    });
    return newUser;
  }

  public static updateMe(options: UpdateMeOptions, userId: string) {
    return this.updateOne(userId, options);
  }

  public static async removeOne(id: string): Promise<{ ok: boolean }> {
    // Get the user to delete
    const user = (await User.findById(id)) as UserInterface | null;
    if (!user)
      throw createError({
        message: "Can't find the user to delete.",
        statusCode: 404,
      });
    // Delete the user
    await User.findByIdAndDelete(id);
    // Set the user's history
    const newestUserHistory = await this.getNewestUserHistory(id);
    const newVersion = newestUserHistory.version + 1;
    delete (user as { _id?: string })._id;
    await UserHistory.create({
      ...user,
      userId: id,
      isDisabled: true,
      updatedAt: new Date(),
      version: newVersion,
    });
    return { ok: true };
  }

  public static async getUserHistory(userId: string) {
    const userHistory = await UserHistory.find({ userId });
    if (userHistory.length === 0)
      throw createError({
        message: "Can't find user history.",
        statusCode: 404,
      });
    const sortedHistory = userHistory.sort((a, b) => a.version - b.version);
    return sortedHistory;
  }

  private static async getNewestUserHistory(userId: string) {
    const userHistory = await this.getUserHistory(userId);
    const newestUserHistory = userHistory.at(-1);
    if (!newestUserHistory)
      throw createError({
        message: "Can't find user history.",
        statusCode: 404,
      });
    return newestUserHistory;
  }
}
