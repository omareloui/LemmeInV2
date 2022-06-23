// deno-lint-ignore-file
import { Document } from "../deps.ts";

type ID = string;
type Doc = { id: string | Document; [key: string]: any };

type CreateReturn = Promise<Doc>;
type GetOneReturn = Promise<Doc>;
type GetAllReturn = Promise<Doc[]>;
type RemoveOneReturn = Promise<boolean>;
type UpdateOneReturn = Promise<Doc>; // The new document

export class BaseService {
  public static create?: (data: any) => CreateReturn;
  public static getOne?: (id: ID) => GetOneReturn;
  public static getAll?: () => GetAllReturn;
  public static removeOne?: (id: ID) => RemoveOneReturn;
  public static updateOne?: (id: ID, data: any) => UpdateOneReturn;

  public static createMine?: (data: any, userId: ID) => CreateReturn;
  public static getOneMine?: (id: ID, userId: ID) => GetOneReturn;
  public static getAllMine?: (userId: ID) => GetAllReturn;
  public static removeOneMine?: (id: ID, userId: ID) => RemoveOneReturn;
  public static updateOneMine?: (
    id: ID,
    data: any,
    userId: ID,
  ) => UpdateOneReturn;
}
