import { ObjectId } from "../../deps.ts";
import { ServiceTester } from "./service.test.helper.ts";

import { generateRandomText } from "../../utils/index.ts";
import { CollectionHelper } from "../../helpers/index.ts";

import { NoteService, TagService } from "../index.ts";
import { Note } from "../../models/index.ts";

const NoteHelper = new CollectionHelper(Note);
const serviceTester = new ServiceTester("note", NoteService);

const noteTitle = "note title";
const noteBody = "some note to encrypt and then decrypt";
const encryptionRegExp = /^[\da-f]{32}\.[\da-f]+$/;

const tagName = generateRandomText(20);
const tag = await TagService.createMine(
  { name: tagName, color: "#333" },
  serviceTester.userId,
);
const tagId = tag.id.toString();

const userId = serviceTester.userId;

serviceTester.testCreateMine({
  body: noteBody,
  title: noteTitle,
  tags: [tagId],
});

serviceTester.testGetOneMine();
serviceTester.testGetAllMine();

serviceTester.test(
  "should have the title and body encrypted on the database",
  async () => {
    const note = await Note.findOne({
      _id: new ObjectId(serviceTester.createdRecordId!.toString()),
      user: serviceTester.userId,
    });
    serviceTester.shouldMatch(note?.body!, encryptionRegExp);
    serviceTester.shouldMatch(note?.title!, encryptionRegExp);
  },
);

serviceTester.test("should decrypt note body and title correctly", async () => {
  const note = await NoteService.getOneMine(
    serviceTester.createdRecordId!,
    userId,
  );
  serviceTester.shouldEquals(note?.body, noteBody);
  serviceTester.shouldEquals(note?.title, noteTitle);
});

serviceTester.test("should get note and populate the tags", async () => {
  const note = await NoteService.getOneMine(
    serviceTester.createdRecordId!,
    serviceTester.userId,
  );
  serviceTester.shouldEquals(note!.tags![0].name, tagName);
  await TagService.removeOneMine(tagId, serviceTester.userId);
});

serviceTester.test("should create note with only the title", async () => {
  const title = "some note title";
  const note = await NoteService.createMine({ title }, userId);
  serviceTester.shouldEquals(note.title, title);
  await NoteService.removeOneMine(note.id.toString(), userId);
});

serviceTester.test("should create note with only the body", async () => {
  const body = "some note body";
  const note = await NoteService.createMine({ body }, serviceTester.userId);
  serviceTester.shouldEquals(note.body, body);
  await NoteService.removeOneMine(note.id.toString(), userId);
});

serviceTester.testAsyncError(
  "should not accept both title and body as empty values",
  async () => {
    await NoteService.createMine({ body: "", title: "" }, serviceTester.userId);
  },
  "The body and title can not both be empty",
);

// =============== Updating =============== //
serviceTester.test(
  "should updating the note body and title and encrypt it and match the update-to value",
  async () => {
    const newBody = "new body for the note";
    await NoteService.updateOneMine(
      serviceTester.createdRecordId!,
      { body: newBody },
      serviceTester.userId,
    );
    const rawDoc = await NoteHelper.findMineById(
      serviceTester.createdRecordId!,
      serviceTester.userId,
    );
    serviceTester.shouldMatch(rawDoc?.body!, encryptionRegExp);
    const doc = await NoteService.getOneMine(
      serviceTester.createdRecordId!,
      serviceTester.userId,
    );
    serviceTester.shouldEquals(doc.body, newBody);
  },
);

serviceTester.testAsyncError(
  "should not update to an empty body (if only provided body without title) if the existing title is empty",
  async () => {
    // First make the title empty
    await NoteService.updateOneMine(
      serviceTester.createdRecordId!,
      { title: "" },
      serviceTester.userId,
    );
    // Update to empty body
    await NoteService.updateOneMine(
      serviceTester.createdRecordId!,
      { body: "" },
      serviceTester.userId,
    );
  },
  "The body and title can not both be empty",
);

serviceTester.testAsyncError(
  "should not update to an empty title (if only provided title without body) if the existing body is empty",
  async () => {
    // Make the title empty
    await NoteService.updateOneMine(
      serviceTester.createdRecordId!,
      { title: "" },
      serviceTester.userId,
    );
    // Update to empty body
    await NoteService.updateOneMine(
      serviceTester.createdRecordId!,
      { body: "" },
      serviceTester.userId,
    );
  },
  "The body and title can not both be empty",
);

serviceTester.testRemovingOneMine();
