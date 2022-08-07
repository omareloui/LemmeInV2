import type { Types } from "mongoose";
import { Tag } from "server/models";
import { Tag as TagInterface, AddTag, DehydratedTag } from "types";
import { createRegex } from "server/utils";

export class TagController {
  public static async createMine(
    { name, color }: AddTag,
    userId: string,
  ): Promise<TagInterface> {
    const tagNameRegex = createRegex(name, { i: true, exactMatch: true });
    const duplicatedTag = await Tag.findOne({
      name: tagNameRegex,
      user: userId,
    });
    if (duplicatedTag)
      throw createError({
        message: "The tag already exists.",
        statusCode: 409,
      });
    return Tag.create({ user: userId, name, color });
  }

  public static async getOneMine(
    id: string,
    userId: string,
  ): Promise<TagInterface> {
    const tag = await Tag.findOne({ _id: id, user: userId });
    if (!tag) throw createError({ message: "Can't find the requested tag." });
    return tag;
  }

  public static async getAllMine(userId: string): Promise<TagInterface[]> {
    const tags = await Tag.find({});
    const normalizedTags = await Promise<TagInterface[]>.all(
      tags.map(x => this.populate(x, userId)),
    );
    const sortedTags = this.sort(normalizedTags);
    return sortedTags;
  }

  public static async populateTags(
    tagsIds: string[],
    userId: string,
  ): Promise<TagInterface[]> {
    const tags = await Tag.find({ _id: { $in: tagsIds }, user: userId });
    return tags;
  }

  public static async updateOneMine(
    id: string,
    options: Partial<AddTag>,
    userId: string,
  ) {
    const tagDoc = await Tag.findOne({ _id: id, user: userId });
    if (!tagDoc)
      throw createError({ message: "Can't find the tag.", statusCode: 404 });

    // If the tag's new make sure it's not duplicated
    if (options.name && tagDoc.name !== options.name) {
      const tagRegex = createRegex(options.name, { i: true, exactMatch: true });
      const duplicatedTag = await Tag.findOne({
        name: tagRegex,
        user: userId,
      });
      if (duplicatedTag)
        throw createError({
          message: "You have a tag with the same name. You can't duplicate it.",
          statusCode: 409,
        });
    }
    const newTag = await Tag.findOneAndUpdate(
      { _id: id, user: userId },
      { name: options.name, color: options.color },
    );
    return newTag;
  }

  public static async removeOneMine(id: string, userId: string) {
    // TODO:
    // await AccountService.removeTagFromAccounts(id, userId);
    // TODO:
    // await NoteService.removeTagFromNotes(id, userId);
    const tag = await Tag.findOne({ _id: id, user: userId });
    if (!tag)
      throw createError({
        message: "Can't find the tag to remove.",
        statusCode: 404,
      });
    await tag.delete();
    return true;
  }

  private static sort(docs: TagInterface[]): TagInterface[] {
    return docs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  private static async populate(
    doc: DehydratedTag & { _id: Types.ObjectId },
    userId: string,
  ): Promise<TagInterface> {
    const tag = { ...doc };
    // TODO:
    // const accounts = await AccountService.getMineWithTag(
    //   tag._id.toString(),
    //   userId,
    // );
    // tag.accountsCount = accounts.length;
    return tag;
  }
}
