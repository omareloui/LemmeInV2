import { Resources } from "../@types/index.ts";
import { TagService, AccountService, NoteService } from "./index.ts";

export class ResourcesService {
  public static async getMine(userId: string): Promise<Resources> {
    const tags = await TagService.getAllMine(userId);
    const notes = await NoteService.getAllMine(userId);
    const accounts = await AccountService.getAllMine(userId);

    return {
      tags,
      accounts,
      notes,
    };
  }
}
