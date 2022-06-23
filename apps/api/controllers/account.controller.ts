import { RouterContext } from "../deps.ts";
import { AccountService } from "../services/index.ts";

export class AccountController {
  public static async create({ request, response, state }: RouterContext) {
    const body = request.body();
    const data = await body.value;
    response.body = await AccountService.createMine(data, state.user.id);
  }

  public static async viewAllMine({ response, state }: RouterContext) {
    response.body = await AccountService.getAllMine(state.user.id);
  }

  public static async viewOneMine({ params, response, state }: RouterContext) {
    response.body = await AccountService.getOneMine(params.id!, state.user.id);
  }

  public static async updateOneMine({
    request,
    params,
    response,
    state,
  }: RouterContext) {
    const body = request.body();
    const data = await body.value;
    response.body = await AccountService.updateOneMine(
      params.id!,
      data,
      state.user.id,
    );
  }

  public static async updateLastUsed({
    params,
    response,
    state,
  }: RouterContext) {
    await AccountService.updateLastUsed(params.id!, state.user.id);
    response.status = 200;
  }

  public static async deleteMine({ response, params, state }: RouterContext) {
    await AccountService.removeOneMine(params.id!, state.user.id);
    response.status = 200;
  }
}
