import { Tester } from "../../helpers/index.ts";

import { RouterContext, testing, RouteParams } from "../../deps.ts";

interface MockContextOptions {
  body?: Record<string, unknown>;
  params?: RouteParams;
  path?: string;
  state?: Record<string, unknown>;
  authToken?: string;
}

export class MiddlewareTester extends Tester {
  constructor(modelName: string) {
    super(`middleware/${modelName}:`);
  }

  public mockContext({
    body,
    params,
    path = "mock-path",
    state,
    authToken,
  }: MockContextOptions = {}) {
    const context = {
      ...testing.createMockContext({ path: path, params: params, state }),
    } as RouterContext;
    // @ts-ignore don't need to check for value's type
    context.request.body = () => ({ value: body });
    if (authToken)
      context.request.headers.set("Authorization", `Bearer ${authToken}`);
    return context;
  }

  public mockNext() {
    return testing.createMockNext();
  }
}
