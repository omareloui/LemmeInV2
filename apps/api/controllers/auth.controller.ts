import type { RouterContext } from "../deps.ts";
import { AuthService } from "../services/index.ts";

export class AuthController {
  public static async login({
    request,
    response,
  }: RouterContext): Promise<void> {
    const body = request.body();
    const options = await body.value;
    response.body = await AuthService.login(options);
  }

  public static async register({ request, response }: RouterContext) {
    const body = request.body();
    const options = await body.value;
    response.body = await AuthService.register(options);
  }

  public static async me({ response, state }: RouterContext) {
    const user = await AuthService.me(state.user.id);
    response.body = user;
  }

  public static async updateMe({ request, response, state }: RouterContext) {
    const body = request.body();
    const options = await body.value;
    response.body = await AuthService.updateMe(
      options,
      state.user.id.toString(),
    );
  }
}
