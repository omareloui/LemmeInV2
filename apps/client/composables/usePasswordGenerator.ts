const characters = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: ".!@#$%^&",
};

export default function usePasswordGenerator({
  includeLowerCase = true,
  includeUpperCase = true,
  includeNumbers = true,
  includeSymbols = true,
  length = 16,
}: {
  includeLowerCase?: boolean;
  includeUpperCase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  length?: number;
} = {}) {
  let minLength = 0;
  let characterSpace = "";

  function setData() {
    if (includeLowerCase) {
      characterSpace += characters.lower;
      minLength += 1;
    }
    if (includeUpperCase) {
      characterSpace += characters.upper;
      minLength += 1;
    }
    if (includeNumbers) {
      characterSpace += characters.numbers;
      minLength += 1;
    }
    if (includeSymbols) {
      characterSpace += characters.symbols;
      minLength += 1;
    }
  }

  function shuffleArray<T>(originalArray: T[]): T[] {
    const arr = [...originalArray];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const newPos = Math.floor(Math.random() * (i + 1)) as number;
      [arr[i], arr[newPos]] = [arr[newPos], arr[i]];
    }
    return arr;
  }

  function generateRandomNumber(max: number) {
    return Math.floor(Math.random() * max);
  }

  function getRandomCharacter(
    characterType: "upper" | "lower" | "numbers" | "symbols",
  ) {
    const charactersToGetFrom = characters[characterType];
    const index = generateRandomNumber(charactersToGetFrom.length);
    return charactersToGetFrom[index];
  }

  function validate() {
    if (length < minLength)
      throw new Error(
        `You can't set the length to "${length}" with the selected options`,
      );
  }

  function generate() {
    validate();

    const randomCharacters = shuffleArray(characterSpace.split(""));
    const password: string[] = [];

    let addedLower = false;
    let addedUpper = false;
    let addedNumber = false;
    let addedSymbol = false;

    for (let i = 0; i < length; i += 1)
      if (includeLowerCase && !addedLower) {
        password.push(getRandomCharacter("lower"));
        addedLower = true;
      } else if (includeUpperCase && !addedUpper) {
        password.push(getRandomCharacter("upper"));
        addedUpper = true;
      } else if (includeNumbers && !addedNumber) {
        password.push(getRandomCharacter("numbers"));
        addedNumber = true;
      } else if (includeSymbols && !addedSymbol) {
        password.push(getRandomCharacter("symbols"));
        addedSymbol = true;
      } else {
        const randomIndex = Math.floor(Math.random() * randomCharacters.length);
        password.push(randomCharacters[randomIndex]);
      }

    return shuffleArray(password).join("");
  }

  setData();
  return generate();
}
