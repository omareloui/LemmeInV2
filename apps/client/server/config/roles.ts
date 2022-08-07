export const roles = ["user", "admin"] as const;
export const roleRights = new Map();

const userRights = [
  "me",
  "manageMyAccounts",
  "manageMyTags",
  "manageMyNotes",
  "manageMyResources",
] as const;
const adminRights = [...userRights, "getUsers", "manageUsers"] as const;

roleRights.set(roles[0], userRights);
roleRights.set(roles[1], adminRights);

export const rights = [...new Set([...userRights, ...adminRights])];
