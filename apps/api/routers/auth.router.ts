import { Router } from "../deps.ts";

import { AuthController } from "../controllers/index.ts";

import { auth, validate } from "../middlewares/index.ts";

import {
  loginValidation,
  registerValidation,
  updateMeValidation,
  meValidation,
} from "../validations/index.ts";

const router = new Router();

router.post("/auth/login", validate(loginValidation), AuthController.login);

router.post(
  "/auth/register",
  validate(registerValidation),
  AuthController.register,
);

router.get("/me", auth("me"), validate(meValidation), AuthController.me);

router.put(
  "/me",
  auth("me"),
  validate(updateMeValidation),
  AuthController.updateMe,
);

export default router;
