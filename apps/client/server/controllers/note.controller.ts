import type { Types } from "mongoose";
import {
  Note as NoteInterface,
  AddNote,
  UpdateNote,
  DehydratedNote,
} from "types";
import { Note } from "server/models";
import { TagController } from "server/controllers";
import { compareArrays } from "server/utils";

export class NoteController {
  public static async createMine(
    { body, tags, title }: AddNote,
    userId: string,
  ): Promise<NoteInterface> {
    if (!title && !body)
      throw createError({
        message: "The body and title can not both be empty.",
        statusCode: 400,
      });

    const note = await Note.create({
      body,
      title,
      tags,
      user: userId,
    });
    return this.populateTags(note, userId);
  }

  public static async getOneMine(
    id: string,
    userId: string,
  ): Promise<NoteInterface> {
    const note = await Note.findOne({ _id: id, user: userId });
    if (!note)
      throw createError({
        message: "Can't find the requested tag.",
        statusCode: 404,
      });
    return this.populateTags(note, userId);
  }

  public static async getAllMine(userId: string): Promise<NoteInterface[]> {
    const notes = await Note.find({ user: userId });
    const sortedNotes = this.sort(notes);
    return Promise.all(sortedNotes.map(x => this.populateTags(x, userId)));
  }

  public static async updateOneMine(
    options: UpdateNote,
    userId: string,
  ): Promise<NoteInterface> {
    const noteDoc = await this.getOneMine(options.id, userId);
    if (!noteDoc)
      throw createError({
        message: "Can't find the note to update.",
        statusCode: 404,
      });
    const fieldsToUpdate: Omit<UpdateNote, "id"> = {};

    // Validate title and body fields
    // If provided body and title both are empty
    const notEmptyError = createError({
      message: "The body and title can not both be empty",
      statusCode: 400,
    });
    if (
      "body" in options &&
      "title" in options &&
      options.body === "" &&
      options.title === ""
    )
      throw notEmptyError;

    // If provided empty title and the original body is empty
    if (!noteDoc.body && "title" in options && options.title === "")
      throw notEmptyError;
    if (!noteDoc.title && "body" in options && options.body === "")
      throw notEmptyError;

    const { title, body, tags } = options;
    // Set the fields to update
    if (body !== undefined && body !== noteDoc.body) fieldsToUpdate.body = body;
    if (title !== undefined && title !== noteDoc.title)
      fieldsToUpdate.title = title;
    if (
      (tags && !noteDoc.tags) ||
      (tags &&
        noteDoc.tags &&
        !compareArrays(
          tags,
          noteDoc.tags.map(x => x._id.toString()),
        ))
    )
      fieldsToUpdate.tags = tags;

    // See if should update or not
    const shouldUpdate = Object.keys(fieldsToUpdate).length > 0;
    if (!shouldUpdate) return noteDoc;

    const newNote = await Note.findByIdAndUpdate(options.id, fieldsToUpdate);
    return this.populateTags(newNote!, userId);
  }

  public static async removeTagFromNotes(tagId: string, userId: string) {
    const notes = await Note.find({ user: userId, tags: tagId });
    await Promise.all(
      notes
        .filter(n => n.tags && n.tags.length > 0)
        .map(async note => {
          const newTags = note.tags!.filter(tag => tag.toString() !== tagId);
          await Note.findByIdAndUpdate(note.id, { tags: newTags });
        }),
    );
    return true;
  }

  public static async removeOneMine(
    id: string,
    userId: string,
  ): Promise<boolean> {
    const note = await Note.findOne({ _id: id, user: userId });
    if (!note)
      throw createError({
        message: "Can't find the note to delete.",
        statusCode: 404,
      });
    await Note.findOneAndDelete({ _id: id, user: userId });
    return true;
  }

  private static sort<
    T extends NoteInterface | (DehydratedNote & { _id: Types.ObjectId }),
  >(docs: T[]): T[] {
    return docs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  private static async populateTags<
    T extends NoteInterface | (DehydratedNote & { _id: Types.ObjectId }),
  >(doc: T, userId: string): Promise<NoteInterface> {
    const tags = await TagController.populateTags(
      doc.tags?.map(x => x._id.toString()) || [],
      userId,
    );

    const note = {
      _id: doc._id,
      title: doc.title,
      body: doc.body,
      tags,
      user: doc.user,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as NoteInterface;

    return note;
  }
}
