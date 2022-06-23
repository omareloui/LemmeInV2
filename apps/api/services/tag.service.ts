import { ObjectId } from "../deps.ts";
import { Doc, Tag as TagType, CreateTagOptions } from "../@types/index.ts";

import { CollectionHelper, ErrorHelper } from "../helpers/index.ts";
import { createRegex } from "../utils/index.ts";

import { Tag, TagSchema } from "../models/index.ts";

import { BaseService, AccountService, NoteService } from "./index.ts";

const TagHelper = new CollectionHelper(Tag);
const tagErrorHelper = new ErrorHelper("tag");

export class TagService extends BaseService {
  public static async createMine(
    { name, color }: CreateTagOptions,
    userId: string,
  ) {
    const tagNameRegex = createRegex(name, { i: true, exactMatch: true });
    const duplicatedTag = await TagHelper.findOne({
      name: tagNameRegex,
      user: userId,
    });
    if (duplicatedTag)
      return tagErrorHelper.badRequest({ message: "The tag already exists" });
    const currentDate = new Date();
    const tag = await TagHelper.createOne({
      name,
      color,
      user: userId,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    if (!tag) return tagErrorHelper.notFound();
    return tag;
  }

  public static async getOneMine(id: string, userId: string) {
    const tag = await TagHelper.findMineById(id, userId);
    if (!tag) return tagErrorHelper.notFound();
    return tag;
  }

  public static async getAllMine(userId: string) {
    const tags = await TagHelper.findAllMine(userId);
    const normalizedTags: TagType[] = await Promise.all(
      tags.map(x => this.populate(x, userId)),
    );
    const sortedTags = this.sort(normalizedTags);
    return sortedTags;
  }

  public static populateTags(
    tagsIds: string[],
    userId: string,
  ): Promise<Doc<TagSchema>[]> {
    const ids = tagsIds.map(x => new ObjectId(x));
    return TagHelper.find({ _id: { $in: ids }, user: userId });
  }

  public static async updateOneMine(
    id: string,
    options: Partial<CreateTagOptions>,
    userId: string,
  ) {
    const tagDoc = await TagHelper.findMineById(id, userId);
    if (!tagDoc) return tagErrorHelper.notFound();

    // If the tag's new make sure it's not duplicated
    if (options.name && tagDoc.name !== options.name) {
      const tagRegex = createRegex(options.name, { i: true, exactMatch: true });
      const duplicatedTag = await TagHelper.findOne({
        name: tagRegex,
        user: userId,
      });
      if (duplicatedTag)
        return tagErrorHelper.badRequest({
          message: "You have a tag with the same name. You can't duplicate it.",
        });
    }
    const newTag = await TagHelper.updateMineById(
      id,
      { name: options.name, color: options.color, updatedAt: new Date() },
      userId,
    );
    return newTag as Doc<TagSchema>;
  }

  public static async removeOneMine(id: string, userId: string) {
    await AccountService.removeTagFromAccounts(id, userId);
    await NoteService.removeTagFromNotes(id, userId);
    const tag = await TagHelper.findMineById(id, userId);
    if (!tag) return tagErrorHelper.notFound();
    await TagHelper.deleteMineById(id, userId);
    return true;
  }

  private static sort(docs: TagType[]): TagType[] {
    return docs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  private static async populate(
    doc: Doc<TagSchema>,
    userId: string,
  ): Promise<TagType> {
    const tag = doc as TagType;
    const accounts = await AccountService.getMineWithTag(
      doc.id.toString(),
      userId,
    );
    tag.accountsCount = accounts.length;
    return tag;
  }
}
