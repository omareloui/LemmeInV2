// deno-lint-ignore-file

import { helpers, RouterContext } from "../deps.ts";

import { config } from "../config/index.ts";
import { ErrorHelper } from "../helpers/index.ts";

const validateErrorHelper = new ErrorHelper("validate");

function checkInvalidParams(fields: any, payload: any): void {
  const allowedParams = Object.keys(fields);
  const requestParams = Object.keys(payload);
  for (const param of requestParams) {
    if (allowedParams.indexOf(param) < 0) {
      return validateErrorHelper.badRequest({
        param,
        message: `${param} is not allowed`,
        name: "ValidationError",
      });
    }
  }
}

async function checkValidation(
  schema: {
    fields: any;
    validate: (
      arg0: unknown,
      arg1: { stripUnknown: boolean; abortEarly: boolean },
    ) => any;
  },
  payload: any,
): Promise<void> {
  checkInvalidParams(schema.fields, payload);
  try {
    await schema.validate(payload, { stripUnknown: true, abortEarly: true });
  } catch (validationErrors) {
    throw validationErrors;
  }
}

export function validate(schema: any) {
  return async (ctx: RouterContext, next: () => void): Promise<void> => {
    const { params: _params, queries: _query, body: _body } = schema;
    const allQueries = [
      {
        type: "body",
        _data: await ctx.request.body().value,
        _schema: _body,
      },
      {
        type: "param",
        _data: ctx.params,
        _schema: _params,
      },
      {
        type: "query",
        _data: config.env !== "test" ? helpers.getQuery(ctx) : undefined,
        _schema: _query,
      },
    ];

    for (const _q of allQueries) {
      // Validate the provided data
      if (_q._schema?.fields && _q._data) {
        try {
          await checkValidation(_q._schema, _q._data);
        } catch (e) {
          return validateErrorHelper.badRequest({
            name: "ValidationError",
            message: e.message,
            param: _q.type,
          });
        }
      }
      // Validate if there's extra data provided
      else if (
        _q._data &&
        Object.keys(_q._data).length &&
        (!_q._schema || (_q._schema && !_q._schema.has("fields")))
      ) {
        return validateErrorHelper.badRequest({
          name: "ValidationError",
          message: `${_q.type} is not allowed`,
          param: _q.type,
        });
      }
    }
    await next();
  };
}
