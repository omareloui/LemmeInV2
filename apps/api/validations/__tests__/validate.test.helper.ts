import { Tester } from "../../helpers/index.ts";

import { RouterContext, testing, RouteParams } from "../../deps.ts";
import { validate } from "../../middlewares/index.ts";

export interface ErrorValidationData {
  description: string;
  schema: Record<string, unknown>;
  body?: Record<string, unknown>;
  params?: RouteParams;
  errorIncludes: string;
}

export type ErrorValidationDataForCreationAndUpdate = Omit<
  ErrorValidationData,
  "schema"
>;

export interface ValidData {
  description: string;
  schema: Record<string, unknown>;
  body?: Record<string, unknown>;
  params?: RouteParams;
}

export class ValidationTester extends Tester {
  constructor(modelName: string) {
    super(`validations/${modelName}:`);
  }

  public async validationMiddleware(
    schema: Record<string, unknown>,
    body?: Record<string, unknown>,
    params?: RouteParams,
  ) {
    // @ts-ignore don't need to check for the value's type
    const mockContext = {
      ...testing.createMockContext({ path: "/validate", params: params }),
      request: { body: () => ({ value: body }) },
    } as RouterContext;
    const mockNext = testing.createMockNext();

    try {
      await validate(schema)(mockContext, mockNext);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  public testWithValidationMiddleware(
    description: string,
    schema: Record<string, unknown>,
    body?: Record<string, unknown>,
    params?: RouteParams,
  ) {
    this.test(description, async () => {
      await this.validationMiddleware(schema, body, params);
    });
  }

  public testWithValidationMiddlewareWithError(
    errorData: ErrorValidationData[],
  ) {
    errorData.forEach(
      ({ description, schema, body, params, errorIncludes }) => {
        this.testAsyncError(
          description,
          async () => {
            await this.validationMiddleware(schema, body, params);
          },
          errorIncludes,
        );
      },
    );
  }

  public testValidData(data: ValidData[]) {
    data.forEach(x => {
      this.testWithValidationMiddleware(
        x.description,
        x.schema,
        x.body,
        x.params,
      );
    });
  }

  public validateCreateAndUpdateErrors(
    errorValidationData: ErrorValidationDataForCreationAndUpdate[],
    createSchema: Record<string, unknown>,
    updateSchema: Record<string, unknown>,
  ) {
    const normalizedData: ErrorValidationData[] = errorValidationData.reduce(
      (prev: ErrorValidationData[], curr) => {
        const newData: ErrorValidationData[] = [createSchema, updateSchema].map(
          (x, i) => {
            const isCreating = i === 0;
            return {
              description: `(${isCreating ? "create" : "update"}) ${
                curr.description
              }`,
              schema: x,
              body: curr.body,
              params:
                curr.params || !isCreating
                  ? { id: "123456789abcdef123456789" }
                  : undefined,
              errorIncludes: curr.errorIncludes,
            };
          },
        );
        return [...prev, ...newData];
      },
      [],
    );
    this.testWithValidationMiddlewareWithError(normalizedData);
  }
}
