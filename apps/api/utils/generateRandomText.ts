export function generateRandomText(length = 16) {
  let string = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return string;
}
