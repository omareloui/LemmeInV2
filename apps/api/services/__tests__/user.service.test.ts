import { ServiceTester } from "./service.test.helper.ts";

import { UserService } from "../index.ts";
import { UserHistory } from "../../models/index.ts";

const serviceTester = new ServiceTester("user", UserService);
const serviceDuplicatedEmailTest = new ServiceTester("user", UserService);

serviceTester.testCreate({
  firstName: "omar",
  lastName: "eloui",
  email: "omareloui@hotmail.com",
  password: "12345678",
});

serviceDuplicatedEmailTest.testAsyncError(
  "should not create a user with an already used email",
  async () => {
    await UserService.create({
      email: "omareloui@hotmail.com",
      firstName: "none",
      lastName: "anything",
      password: "12345",
    });
  },
  "email is already in use",
);

serviceDuplicatedEmailTest.testAsyncError(
  "should not create a user with an already used email when entering it case insensitively",
  async () => {
    await UserService.create({
      email: "OMARELOUI@HOTMAIL.COM",
      firstName: "none",
      lastName: "anything",
      password: "12345",
    });
  },
  "email is already in use",
);

serviceTester.testGetOne();
serviceTester.testGetAll();

serviceTester.testUpdateOne({ lastName: "elwy" });
serviceTester.testUpdateOne({ firstName: "kenzy" });

serviceTester.testRemovingOne();

serviceTester.test(
  "should have 4 history for the documents for the current user after updating twice and deleting him/her",
  async () => {
    const userHistory = await UserService.getUserHistory(
      serviceTester.createdRecordId!,
    );
    serviceTester.shouldEquals(userHistory.length, 4);
    await UserHistory.drop();
  },
);
