import { AccessTokenContent } from "types";
import { rights, roleRights } from "server/config";

import type { CompatibilityEvent } from "h3";

type Rights = typeof rights;

export function alreadySignedGuard(event: CompatibilityEvent) {
  const user = event.context.user as AccessTokenContent | undefined;
  if (user)
    throw createError({ message: "You are already signed.", statusCode: 409 });
}

export function authenticationGuard(event: CompatibilityEvent) {
  const user = event.context.user as AccessTokenContent | undefined;
  if (!user)
    throw createError({
      message: "You have to be signed to view this page.",
      statusCode: 401,
    });
}

export function authorizationGuard(
  event: CompatibilityEvent,
  ...requiredRights: Rights
) {
  const forbiddenError = createError({
    message: "You're not allowed to view this page.",
    statusCode: 403,
  });

  const user = event.context.user as AccessTokenContent | undefined;
  if (!user) throw forbiddenError;
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every(requiredRight =>
      userRights.includes(requiredRight),
    );

    if (!hasRequiredRights) throw forbiddenError;
  }
}
