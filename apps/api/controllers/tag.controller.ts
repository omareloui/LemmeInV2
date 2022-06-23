import type { RouterContext } from "../deps.ts";
import { TagService } from "../services/index.ts";

export class TagController {
  public static async create({ request, response, state }: RouterContext) {
    const body = request.body();
    const { name, color } = await body.value;
    response.body = await TagService.createMine({ name, color }, state.user.id);
  }

  public static async viewAllMine({ response, state }: RouterContext) {
    response.body = await TagService.getAllMine(state.user.id);
  }

  public static async updateMine({
    request,
    params,
    response,
    state,
  }: RouterContext) {
    const body = request.body();
    const { name, color } = await body.value;
    response.body = await TagService.updateOneMine(
      params.id!,
      { name, color },
      state.user.id,
    );
  }

  public static async deleteMine({ response, params, state }: RouterContext) {
    await TagService.removeOneMine(params.id!, state.user.id);
    response.status = 200;
  }
}
