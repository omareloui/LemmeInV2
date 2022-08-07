import bcrypt from "bcrypt";

export function hash(password: string) {
  const HASH_ROUNDS = 14;

  return new Promise<string>((resolve, reject) => {
    bcrypt.hash(password, HASH_ROUNDS, (error, hashString) => {
      if (error) reject(error.message);
      else resolve(hashString);
    });
  });
}

export function compareHash(plainPassword: string, hashedPassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(plainPassword, hashedPassword, (error, result) => {
      if (error) reject(error.message);
      else resolve(result);
    });
  });
}
