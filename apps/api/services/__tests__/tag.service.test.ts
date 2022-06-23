import { ServiceTester } from "./service.test.helper.ts";
import { TagService, AccountService } from "../index.ts";

const serviceTester = new ServiceTester("tag", TagService);
const serviceTesterDuplication = new ServiceTester("tag", TagService);

serviceTester.testCreateMine({ name: "testingTag", color: "#fff" });
serviceTester.testGetAllMine();
serviceTester.testGetOneMine();

serviceTester.test(
  "should normalize all tags with accounts count",
  async () => {
    if (!serviceTester.service.getAllMine)
      throw new Error("This service doesn't have getOneMine");
    const records = await serviceTester.service.getAllMine(
      serviceTester.userId,
    );
    // deno-lint-ignore no-explicit-any
    serviceTester.shouldHaveProperty(records[0] as any, "accountsCount");
  },
);

serviceTester.testAsyncError(
  "should throw error on creating new testing with the same name",
  async () => {
    await TagService.createMine(
      { name: "testingTag", color: "#123" },
      serviceTester.userId,
    );
  },
  "already exists",
);

serviceTester.testUpdateOneMine({ name: "testingTag" });
serviceTester.testUpdateOneMine({ color: "#ooo" });
serviceTester.testUpdateOneMine({ name: "updatedTag" });

serviceTesterDuplication.testCreateMine({ name: "shouldNotDuplicate" });
serviceTester.testAsyncError(
  "should throw error on updating tag with a name that another tag holds",
  async () => {
    await TagService.updateOneMine(
      serviceTester.createdRecordId!,
      { name: "shouldNotDuplicate" },
      serviceTester.userId,
    );
  },
  "can't duplicate it",
);

serviceTester.testRemovingOneMine();
serviceTesterDuplication.testRemovingOneMine();

serviceTester.test(
  "should delete the tag from created account on deletion",
  () => {
    async () => {
      const { userId } = serviceTester;
      const createdTag = await TagService.createMine(
        { name: "testingTag", color: "#fff" },
        userId,
      );
      const createdAccount1 = await AccountService.createMine(
        {
          app: "some app",
          password: "123456789",
          tags: [createdTag.id.toString()],
        },
        userId,
      );
      const createdAccount2 = await AccountService.createMine(
        {
          app: "some app 2",
          password: "123456789",
          tags: [createdTag.id.toString()],
        },
        userId,
      );
      await TagService.removeOneMine(createdTag.id.toString(), userId);
      const createdAccount1After = await AccountService.getOneMine(
        createdAccount1.id.toString(),
        userId,
      );
      const createdAccount2After = await AccountService.getOneMine(
        createdAccount2.id.toString(),
        userId,
      );
      serviceTester.shouldEquals(
        createdAccount1After.tags.length === 0 &&
          createdAccount2After.tags.length === 0,
        true,
      );

      [createdAccount1.id.toString(), createdAccount2.id.toString()].forEach(
        id => AccountService.removeOneMine(id, userId),
      );
    };
  },
);
