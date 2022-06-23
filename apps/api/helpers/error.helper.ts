import { capitalize } from "../utils/index.ts";

type StatusText =
  | "Ok"
  | "NotModified"
  | "BadRequest"
  | "Unauthorized"
  | "Forbidden"
  | "InternalServerError";
type ErrorAction = "create" | "find" | "update" | "delete";

type ErrorOptions = {
  param?: string;
  message?: string;
  action?: ErrorAction;
  name?: string;
  path?: string;
};

type HelperErrorMethod = (field: string, options?: ErrorOptions) => never;

interface Error {
  status: number;
  type: StatusText;
  name: string;
  path?: string;
  param: string;
  message: string;
}

export class ErrorHelper {
  static status = {
    ok: 200,
    notModified: 304,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    internalServerError: 500,
  };

  constructor(public field: string) {}

  public static throw({
    message,
    status,
    path,
    param,
    type,
    name,
  }: Error): never {
    throw { message, status, path, param, type, name };
  }

  public static notFound: HelperErrorMethod = (field, options) => {
    throw {
      status: 404,
      name: options?.name || "NotFound",
      path: options?.path || field,
      param: options?.param || field,
      message: options?.message || `${capitalize(field)} not found`,
      type: "NotFound",
    };
  };

  public static badRequest: HelperErrorMethod = (field, options) => {
    throw {
      status: 400,
      name: options?.name || "BadRequest",
      path: options?.path || field,
      param: options?.param || field,
      message: options?.message
        ? options.message
        : options?.action
        ? `Could not ${options.action} ${field}`
        : `Could not preform the action on ${field}`,
      type: "BadRequest",
    };
  };

  public throw({ message, status, path, param, type, name }: Error): never {
    throw { message, status, path, param, type, name };
  }

  notFound(options?: ErrorOptions): never {
    throw {
      status: 400,
      name: options?.name || "BadRequest",
      path: options?.path || this.field,
      param: options?.param || this.field,
      message: options?.message || `${capitalize(this.field)} not found`,
      type: "BadRequest",
    };
  }

  badRequest(options?: ErrorOptions): never {
    throw {
      status: 400,
      name: options?.name || "BadRequest",
      path: options?.path || this.field,
      param: options?.param || this.field,
      message: options?.message
        ? options.message
        : options?.action
        ? `Could not ${options.action} ${this.field}`
        : `Could not preform the action on ${this.field}`,
      type: "BadRequest",
    };
  }

  unauthorized(options?: ErrorOptions): never {
    throw {
      status: 401,
      name: options?.name || "Unauthorized",
      message: options?.message || `Invalid token`,
      type: "Unauthorized",
      path: options?.path || this.field,
      param: options?.param || this.field,
    };
  }

  forbidden(options?: ErrorOptions): never {
    throw {
      status: 403,
      name: options?.name || "Forbidden",
      message: options?.message || `Insufficient rights`,
      type: "Unauthorized",
      path: options?.path || this.field,
      param: options?.param || this.field,
    };
  }
}
