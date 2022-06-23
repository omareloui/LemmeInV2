import type { RouterContext } from "../deps.ts";
import { NoteService } from "../services/index.ts";

export class NoteController {
  public static async create({ request, response, state }: RouterContext) {
    const body = request.body();
    const options = await body.value;
    response.body = await NoteService.createMine(options, state.user.id);
  }

  public static async viewAllMine({ response, state }: RouterContext) {
    response.body = await NoteService.getAllMine(state.user.id);
  }

  public static async updateMine({
    request,
    params,
    response,
    state,
  }: RouterContext) {
    const body = request.body();
    const options = await body.value;
    response.body = await NoteService.updateOneMine(
      params.id!,
      options,
      state.user.id,
    );
  }

  public static async deleteMine({ response, params, state }: RouterContext) {
    await NoteService.removeOneMine(params.id!, state.user.id);
    response.status = 200;
  }
}
