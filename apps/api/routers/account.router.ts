import { Router } from "../deps.ts";

import { AccountController } from "../controllers/index.ts";

import { auth, validate } from "../middlewares/index.ts";

import {
  createAccountValidation,
  deleteAccountValidation,
  getAccountsValidation,
  getAccountValidation,
  updateAccountValidation,
  updateAccountLastUsedValidation,
} from "../validations/index.ts";

const router = new Router();

router.get(
  "/accounts",
  validate(getAccountsValidation),
  auth("manageMyAccounts"),
  AccountController.viewAllMine,
);

router.post(
  "/accounts",
  validate(createAccountValidation),
  auth("manageMyAccounts"),
  AccountController.create,
);

router.get(
  "/accounts/:id",
  validate(getAccountValidation),
  auth("manageMyAccounts"),
  AccountController.viewOneMine,
);

router.put(
  "/accounts/:id",
  validate(updateAccountValidation),
  auth("manageMyAccounts"),
  AccountController.updateOneMine,
);

router.put(
  "/accounts/:id/last-used",
  validate(updateAccountLastUsedValidation),
  auth("manageMyAccounts"),
  AccountController.updateLastUsed,
);

router.delete(
  "/accounts/:id",
  validate(deleteAccountValidation),
  auth("manageMyAccounts"),
  AccountController.deleteMine,
);

export default router;
