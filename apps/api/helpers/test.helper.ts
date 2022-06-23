import {
  assert,
  assertEquals,
  assertMatch,
  assertThrows,
  assertThrowsAsync,
} from "../deps.ts";

import { Role } from "../@types/index.ts";
import { generateRandomText } from "../utils/index.ts";

import { AuthService, UserService } from "../services/index.ts";

type TestFunction = () => void | Promise<void>;

export class Tester {
  createdUsersId: string[];

  constructor(public namePrefix: string) {
    this.createdUsersId = [];
  }

  public assert = assert;
  public shouldEquals = assertEquals;
  public shouldMatch = assertMatch;
  public shouldHaveProperty(obj: Record<string, unknown>, prop: string) {
    assertEquals(Object.hasOwn(obj, prop), true);
  }
  public shouldHaveSameObjectPropertiesWValue(
    subObj: Record<string, unknown>,
    obj: Record<string, unknown>,
  ) {
    Object.keys(subObj).forEach(key => {
      this.shouldEquals(obj[key], subObj[key]);
    });
  }

  public test(description: string, testFunction: TestFunction, isOnly = false) {
    Deno.test({
      name: `${this.namePrefix} ${description}`,
      only: isOnly,
      fn: testFunction,
    });
  }

  public testAsyncError(
    description: string,
    cb: () => unknown,
    errorMessageIncludes: string,
  ) {
    const promiseCallBack = async (
      res: (value: unknown) => void,
      rej: (value: unknown) => void,
    ) => {
      try {
        res(await cb());
      } catch (e) {
        rej(new Error(e.message));
      }
    };

    const assertionCallBack = () => new Promise(promiseCallBack);
    const assertionFunction = () =>
      assertThrowsAsync(assertionCallBack, Error, errorMessageIncludes);

    this.test(description, assertionFunction);
  }

  public testError(
    description: string,
    cb: () => unknown,
    errorMessageIncludes: string,
  ) {
    this.test(description, () => {
      assertThrows(
        () => {
          cb();
        },
        Error,
        errorMessageIncludes,
      );
    });
  }

  public async getToken(role?: Role) {
    const logData = {
      email: `${generateRandomText()}@gmail.com`,
      password: "123456789",
    };
    const createdUser = await AuthService.register({
      firstName: generateRandomText(8),
      lastName: generateRandomText(8),
      role,
      ...logData,
    });
    this.createdUsersId.push(createdUser.user.id);
    const token = createdUser.token.token;
    return token;
  }

  public removeCratedUsers() {
    if (this.createdUsersId.length === 0)
      throw new Error("No user created to remove");
    this.createdUsersId.forEach(async id => {
      await UserService.removeOne(id);
    });
  }
}
