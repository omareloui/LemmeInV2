import { ObjectId, Collection, FindOptions } from "../deps.ts";

import {
  ID,
  Doc,
  CollectionDocument,
  FindOneReturn,
  FindReturn,
  UpdateReturn,
  CollectionFindOptions,
  CollectionUpdateOptions,
  CreateReturn,
  DropReturn,
  DeleteReturn,
} from "../@types/index.ts";

import { config } from "../config/index.ts";

const { env } = config;

export class CollectionHelper<T extends CollectionDocument> {
  private findOptions: FindOptions;

  constructor(public collection: Collection<T>) {
    this.findOptions = { noCursorTimeout: env !== "production" };
  }

  async find(options?: CollectionFindOptions<T>): FindReturn<T> {
    const docs = await this.collection
      .find(options, this.findOptions)
      .toArray();
    return docs.map(this.replaceUnderScoreIdWithId);
  }

  async findOne(options: CollectionFindOptions<T>): FindOneReturn<T> {
    const doc = await this.collection.findOne(options, this.findOptions);
    return doc && this.replaceUnderScoreIdWithId(doc);
  }

  findById(id: ID): FindOneReturn<T> {
    // @ts-ignore for some reason it casts an unnecessary error
    return this.findOne({ _id: new ObjectId(id) });
  }

  findMineById(id: ID, userId: string): FindOneReturn<T> {
    // @ts-ignore 'cause it might not have a user property
    return this.findOne({ _id: new ObjectId(id), user: userId });
  }

  findAllMine(userId: string): FindReturn<T> {
    // @ts-ignore 'cause it might not have a user property
    return this.find({ user: userId });
  }

  async createOne(data: Partial<T>): CreateReturn<T> {
    const createdCollectionId = await this.collection.insertOne(data);
    return (await this.findById(createdCollectionId))!;
  }

  async updateById(
    id: ID,
    newOptions: CollectionUpdateOptions<T>,
  ): UpdateReturn<T> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: newOptions },
    );
    return this.findById(id);
  }

  async updateMineById(
    id: ID,
    newOptions: CollectionUpdateOptions<T>,
    userId: string,
  ): UpdateReturn<T> {
    await this.collection.updateOne(
      { _id: new ObjectId(id), user: userId },
      { $set: newOptions },
    );
    return this.findById(id);
  }

  async deleteById(id: ID): DeleteReturn {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteMineById(id: ID, userId: string): DeleteReturn {
    await this.collection.deleteOne({ _id: new ObjectId(id), user: userId });
  }

  async drop(): DropReturn {
    await this.collection.drop();
  }

  private replaceUnderScoreIdWithId<T extends CollectionDocument>(
    doc: T,
  ): Doc<T> {
    const y = { id: doc._id, ...doc };
    delete (y as { _id?: string })._id;
    return y;
  }
}
