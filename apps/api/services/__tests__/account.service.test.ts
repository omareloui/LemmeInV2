import { mongoIdRegExp, generateRandomText } from "../../utils/index.ts";
import { ServiceTester } from "./service.test.helper.ts";
import { CollectionHelper } from "../../helpers/index.ts";

import { Account } from "../../models/index.ts";
import { AccountService, TagService } from "../index.ts";

const AccountHelper = new CollectionHelper(Account);
const serviceTester = new ServiceTester("account", AccountService);
const oAuthServiceTester = new ServiceTester("account", AccountService);

const passwordToTestOn = "134.a2!4~234";

const tagName = generateRandomText(20);
const tag = await TagService.createMine(
  { name: tagName, color: "#333" },
  serviceTester.userId,
);
const tagId = tag.id.toString();

await AccountHelper.drop();

serviceTester.testCreateMine({
  app: "google.com",
  password: passwordToTestOn,
  tags: [tagId],
});

serviceTester.testGetOneMine();
serviceTester.testGetAllMine();

serviceTester.test("should decrypt password correctly", async () => {
  const password = await AccountService.decrypt(
    serviceTester.createdRecordId!,
    serviceTester.userId,
  );
  serviceTester.shouldEquals(password, passwordToTestOn);
});

serviceTester.test("should get password and populate the tags", async () => {
  const password = await AccountService.getOneMine(
    serviceTester.createdRecordId!,
    serviceTester.userId,
  );
  serviceTester.shouldEquals(password!.tags![0].name, tagName);
  await TagService.removeOneMine(tagId, serviceTester.userId);
});

oAuthServiceTester.test(
  "should create password with no encryption if it's oAuthed and populate it when getting it",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("No record created yet for the oAuth");
    const newPassword = await AccountService.createMine(
      {
        app: "oAuthed app",
        password: serviceTester.createdRecordId.toString(),
        isOAuth: true,
      },
      oAuthServiceTester.userId,
    );
    const newPasswordId = newPassword.id.toString();
    const password = await AccountService.getOneMine(
      newPasswordId,
      oAuthServiceTester.userId,
    );
    if (!password || !password.password)
      throw new Error("Got no password for oAuth");
    // @ts-ignore ignore that the password could  be as string
    serviceTester.shouldMatch(password.password.id, mongoIdRegExp);
    await AccountService.removeOneMine(
      newPasswordId,
      oAuthServiceTester.userId,
    );
  },
);

// =============== Updating =============== //
serviceTester.test("should updating the password's app", async () => {
  if (!serviceTester.createdRecordId)
    throw new Error("Didn't create the record yet");

  const newApp = "new app name";
  await AccountService.updateOneMine(
    serviceTester.createdRecordId,
    { app: newApp },
    serviceTester.userId,
  );

  const doc = await AccountService.getOneMine(
    serviceTester.createdRecordId,
    serviceTester.userId,
  );

  serviceTester.shouldEquals(doc.app, newApp);
});

serviceTester.test(
  "should update updatedAt date and should update site if provided",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const recordToUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    // The update the app with the same last app name so it shouldn't update it
    await AccountService.updateOneMine(
      serviceTester.createdRecordId,
      { site: "https://newsite.com" },
      serviceTester.userId,
    );
    // await serviceTester.testUpdateOneMine({ site: "https://brandnewsite.com" });
    const recordAfterUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    serviceTester.shouldEquals(
      Number(recordToUpdate.updatedAt) < Number(recordAfterUpdate.updatedAt),
      true,
    );
  },
);

serviceTester.test(
  "should not update the site if provided with undefined value",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    // The update the app with the same last app name so it shouldn't update it
    await AccountService.updateOneMine(
      serviceTester.createdRecordId,
      { site: undefined },
      serviceTester.userId,
    );
    // await serviceTester.testUpdateOneMine({ site: "https://brandnewsite.com" });
    const recordAfterUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    serviceTester.shouldEquals(
      recordAfterUpdate.site === "https://newsite.com",
      true,
    );
  },
);

serviceTester.test(
  "should update the site if provided with empty string",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    // The update the app with the same last app name so it shouldn't update it
    await AccountService.updateOneMine(
      serviceTester.createdRecordId,
      { site: "" },
      serviceTester.userId,
    );
    // await serviceTester.testUpdateOneMine({ site: "https://brandnewsite.com" });
    const recordAfterUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    serviceTester.shouldEquals(recordAfterUpdate.site === "", true);
  },
);

serviceTester.test(
  "should not update updated at date if no data provided and shouldn't update app field if same value",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const recordToUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    // The update the app with the same last app name so it shouldn't update it
    await serviceTester.testUpdateOneMine({ app: "new app name" });
    const recordAfterUpdate = await AccountService.getOneMine(
      serviceTester.createdRecordId,
      serviceTester.userId,
    );
    serviceTester.shouldEquals(
      recordToUpdate.updatedAt,
      recordAfterUpdate.updatedAt,
    );
  },
);

serviceTester.test(
  "should update and decrypt the password if provided with no oauth",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const newPass = "new so random password";

    const id = serviceTester.createdRecordId;
    const userId = serviceTester.userId;

    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");

    await AccountService.updateOneMine(
      id,
      { password: newPass, isOAuth: false },
      userId,
    );

    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);

    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");

    serviceTester.shouldEquals(
      recordAfterUpdate.password !== newPass &&
        recordAfterUpdate.password !== recordToUpdate.password,
      true,
    );
    serviceTester.shouldMatch(
      recordAfterUpdate.password,
      /[\da-f]{32}.[\da-f]/i,
    );
  },
);

serviceTester.testAsyncError(
  "should not update the password if provided as oauth with invalid id",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const newPassId = "abf2f3d3a3aa";

    const id = serviceTester.createdRecordId;
    const userId = serviceTester.userId;

    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");

    await AccountService.updateOneMine(
      id,
      { password: newPassId, isOAuth: true },
      userId,
    );

    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);

    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");

    serviceTester.shouldEquals(
      recordAfterUpdate.password !== newPassId &&
        recordAfterUpdate.password === recordToUpdate.password,
      true,
    );
  },
  "Can't update the password with invalid password id",
);

serviceTester.testAsyncError(
  "should not update the password if it is an id for a password that is the current password id",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const newPass = serviceTester.createdRecordId.toString();

    const id = serviceTester.createdRecordId;
    const userId = serviceTester.userId;

    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");

    await AccountService.updateOneMine(
      id,
      { password: newPass, isOAuth: true },
      userId,
    );

    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);

    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");

    serviceTester.shouldEquals(
      recordAfterUpdate.password !== newPass &&
        recordAfterUpdate.password === recordToUpdate.password,
      true,
    );
  },
  "Can't update the password to the current password",
);

serviceTester.testAsyncError(
  "should not update the password if it is an id for a password that points to the current one",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    // The oauth was created pointing to the current one
    const newPass = await AccountHelper.createOne({
      app: "some app",
      password: serviceTester.createdRecordId.toString(),
      user: serviceTester.userId,
    });

    const id = serviceTester.createdRecordId.toString();
    const userId = serviceTester.userId;

    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");

    await AccountService.updateOneMine(
      id,
      { password: newPass.id.toString(), isOAuth: true },
      userId,
    );

    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");

    serviceTester.shouldEquals(
      recordAfterUpdate.password !== newPass &&
        recordAfterUpdate.password === recordToUpdate.password,
      true,
    );
  },
  "Can't update the password to a password that points to the current one or one of it's references points to the current one",
);

serviceTester.testAsyncError(
  "should not update the password if it is an id for a password that points to a password that points to the current one",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");

    const passPointingToCurrentId = (
      await AccountHelper.createOne({
        app: "some app",
        password: serviceTester.createdRecordId.toString(),
        user: serviceTester.userId,
      })
    ).id.toString();
    const passPointingToTheOnePointingToCurrentId = (
      await AccountHelper.createOne({
        app: "some app",
        password: passPointingToCurrentId,
        user: serviceTester.userId,
      })
    ).id.toString();

    const id = serviceTester.createdRecordId;
    const userId = serviceTester.userId;

    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");

    await AccountService.updateOneMine(
      id,
      { password: passPointingToTheOnePointingToCurrentId, isOAuth: true },
      userId,
    );

    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");

    serviceTester.shouldEquals(
      recordAfterUpdate.password !== passPointingToTheOnePointingToCurrentId &&
        recordAfterUpdate.password === recordToUpdate.password,
      true,
    );

    await Promise.all(
      [passPointingToCurrentId, passPointingToCurrentId].map(id =>
        AccountHelper.deleteMineById(id, userId),
      ),
    );
  },
  "Can't update the password to a password that points to the current one or one of it's references points to the current one",
);

serviceTester.test(
  "should update the password if provided with oauth id",
  async () => {
    if (!serviceTester.createdRecordId)
      throw new Error("Didn't create the record yet");
    const id = serviceTester.createdRecordId.toString();
    const userId = serviceTester.userId;
    const createdId = (
      await AccountHelper.createOne({
        app: "any new pass",
        password: "just_for_the_id",
        user: userId,
      })
    ).id.toString();
    const recordToUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordToUpdate)
      throw new Error("Couldn't find the record before update");
    await AccountService.updateOneMine(
      id,
      { password: createdId, isOAuth: true },
      userId,
    );
    const recordAfterUpdate = await AccountHelper.findMineById(id, userId);
    if (!recordAfterUpdate)
      throw new Error("Couldn't find the record after update");
    serviceTester.shouldEquals(
      recordAfterUpdate.password === createdId &&
        recordAfterUpdate.password !== recordToUpdate.password,
      true,
    );
    await AccountHelper.deleteById(createdId);
  },
);

// =============== Deleting =============== //
serviceTester.testAsyncError(
  "should not delete the password if there's one pointing to the current one",
  async () => {
    const id = serviceTester.createdRecordId;
    const userId = serviceTester.userId;
    if (!id) throw new Error("Didn't create the record yet");
    await AccountHelper.createOne({
      app: "any new pass",
      password: id,
      user: userId,
    });
    await AccountService.removeOneMine(id, userId);
  },
  "You can't delete this account because it has password(s) that point to it",
);

serviceTester.test("should delete password fine", async () => {
  const userId = serviceTester.userId;
  const createdPasswordId = (
    await AccountHelper.createOne({
      app: "any new pass",
      password: "some_pass",
      user: userId,
    })
  ).id.toString();
  await AccountService.removeOneMine(createdPasswordId, userId);
  const deletedPassword = await AccountHelper.findById(createdPasswordId);
  serviceTester.shouldEquals(!deletedPassword, true);
});
