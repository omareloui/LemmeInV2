import { Resources } from "types";
import { TagController, NoteController, AccountController } from ".";

export class ResourcesController {
  public static async getMine(userId: string): Promise<Resources> {
    const tags = await TagController.getAllMine(userId);
    const notes = await NoteController.getAllMine(userId);
    const accounts = await AccountController.getAllMine(userId);

    return {
      tags,
      accounts,
      notes,
    };
  }
}
