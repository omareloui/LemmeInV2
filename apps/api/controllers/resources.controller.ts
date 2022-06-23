import type { RouterContext } from "../deps.ts";
import { ResourcesService } from "../services/index.ts";

export class ResourcesController {
  public static async getMine({ response, state }: RouterContext) {
    response.body = await ResourcesService.getMine(state.user.id);
  }
}
