import {
  Doc,
  Note as NoteType,
  UpdateNoteOptions,
  CreateNoteOptions,
} from "../@types/index.ts";
import { Note, NoteSchema } from "../models/index.ts";
import { compareArrays } from "../utils/index.ts";

import { CollectionHelper, ErrorHelper } from "../helpers/index.ts";

import { BaseService, TagService } from "./index.ts";

const NoteHelper = new CollectionHelper(Note);
const noteErrorHelper = new ErrorHelper("note");

export class NoteService extends BaseService {
  public static async createMine(
    { body, tags, title }: CreateNoteOptions,
    userId: string,
  ): Promise<NoteType> {
    const currentDate = new Date();
    if (!title && !body)
      noteErrorHelper.badRequest({
        message: "The body and title can not both be empty",
      });

    const note = await NoteHelper.createOne({
      body,
      title,
      tags: tags || [],
      user: userId,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    if (!note) return noteErrorHelper.notFound();
    await this.populateTags(note, userId);
    return note as NoteType;
  }

  public static async getOneMine(
    id: string,
    userId: string,
  ): Promise<NoteType> {
    const note = await NoteHelper.findMineById(id, userId);
    if (!note) return noteErrorHelper.notFound();
    await this.populateTags(note, userId);
    return note as NoteType;
  }

  public static async getAllMine(userId: string): Promise<NoteType[]> {
    const notes = await NoteHelper.findAllMine(userId);
    const sortedNotes = this.sort(notes);
    await Promise.all(notes.map(x => this.populateTags(x, userId)));
    return sortedNotes;
  }

  public static async updateOneMine(
    id: string,
    { body, tags, title }: Omit<UpdateNoteOptions, "updatedAt">,
    userId: string,
  ): Promise<NoteType> {
    const noteDoc = await this.getOneMine(id, userId);
    if (!noteDoc) return noteErrorHelper.notFound();
    const fieldsToUpdate: UpdateNoteOptions = {};

    // Validate title and body fields
    // If provided body and title both are empty
    if (body === "" && title === "")
      noteErrorHelper.badRequest({
        message: "The body and title can not both be empty",
      });

    // If provided empty title and the original body is empty
    if (noteDoc.body === "" && title === "")
      noteErrorHelper.badRequest({
        message: "The body and title can not both be empty",
      });
    if (noteDoc.title === "" && body === "")
      noteErrorHelper.badRequest({
        message: "The body and title can not both be empty",
      });

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
          noteDoc.tags.map(x => x.id),
        ))
    )
      fieldsToUpdate.tags = tags;

    // See if should update or not
    const shouldUpdate = Object.keys(fieldsToUpdate).length > 0;
    if (!shouldUpdate) return noteDoc as NoteType;

    fieldsToUpdate.updatedAt = new Date();

    const newNote = await NoteHelper.updateMineById(id, fieldsToUpdate, userId);
    await this.populateTags(newNote!, userId);
    return newNote as NoteType;
  }

  public static async removeTagFromNotes(tagId: string, userId: string) {
    const notes = await NoteHelper.find({ user: userId, tags: tagId });
    for (const note of notes) {
      if (!note.tags || note.tags.length === 0) continue;
      const newTags = (note.tags as string[]).filter(tag => tag !== tagId);
      await NoteHelper.updateMineById(note.id, { tags: newTags }, userId);
    }
    return true;
  }

  public static async removeOneMine(
    id: string,
    userId: string,
  ): Promise<boolean> {
    const note = await NoteHelper.findMineById(id, userId);
    if (!note) return noteErrorHelper.notFound();
    await NoteHelper.deleteMineById(id, userId);
    return true;
  }

  private static sort(docs: NoteType[] | Doc<NoteSchema>[]): NoteType[] {
    return docs.sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    ) as NoteType[];
  }

  private static async populateTags(
    doc: NoteSchema | Doc<NoteSchema>,
    userId: string,
  ): Promise<NoteType> {
    const note = doc as NoteType;
    note.tags = await TagService.populateTags(
      (doc.tags as string[]) || [],
      userId,
    );
    return note;
  }
}
