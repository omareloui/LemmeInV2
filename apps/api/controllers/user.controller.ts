import type { RouterContext } from "../deps.ts";
import { UserService } from "../services/index.ts";

export class UserController {
  public static async create({
    request,
    response,
  }: RouterContext): Promise<void> {
    const body = request.body();
    const { firstName, lastName, email, password, role } = await body.value;
    response.body = await UserService.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
  }

  public static async viewAll({ response }: RouterContext): Promise<void> {
    response.body = await UserService.getAll();
  }

  public static async viewOne({
    params,
    response,
  }: RouterContext): Promise<void> {
    const { id } = params;
    response.body = await UserService.getOne(id as string);
  }

  public static async updateOne({
    params,
    request,
    response,
  }: RouterContext): Promise<void> {
    const { id } = params;
    const body = request.body();
    const { firstName, lastName, email, password, role } = await body.value;
    response.body = await UserService.updateOne(id as string, {
      firstName,
      lastName,
      email,
      password,
      role,
    });
  }

  public static async removeOne({
    params,
    response,
  }: RouterContext): Promise<void> {
    const { id } = params;
    await UserService.removeOne(id as string);
    response.status = 200;
  }
}
