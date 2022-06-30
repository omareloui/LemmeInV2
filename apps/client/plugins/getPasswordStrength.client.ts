import {
  PasswordScore,
  PasswordStrengthValues,
  PasswordStrengthColors,
} from "~~/@types";

function calculateScore(password: string): PasswordScore {
  let score = 0;
  const { length } = password;
  const suggestions: string[] = [];

  // Calc score for length
  if (length >= 16) score += 6;
  else {
    if (length >= 10) score += 4;
    else if (length >= 8) score += 3;
    else if (length >= 6) score += 2;
    else if (length >= 4) score += 1;
    suggestions.push("Make it 16 characters long");
  }
  const DIVERSITIES = ["lowercase", "uppercase", "number", "symbol"] as const;
  const diversity = [] as typeof DIVERSITIES[number][];
  if (password.match(/(?=[a-z])/g)) diversity.push("lowercase");
  if (password.match(/(?=[A-Z])/g)) diversity.push("uppercase");
  if (password.match(/(?=\d)/g)) diversity.push("number");
  if (password.match(/(?=[!@#$%^&])/g)) diversity.push("symbol");

  // Calc score if diversity
  DIVERSITIES.forEach(x => {
    if (diversity.includes(x)) score += 1;
    else {
      const add = (sug: string) => suggestions.push(sug);
      switch (x) {
        case "lowercase":
          add("Add a lowercase letter");
          break;
        case "uppercase":
          add("Add an uppercase letter");
          break;
        case "number":
          add("Add a number");
          break;
        case "symbol":
          add("Add a symbol");
          break;
        default:
          break;
      }
    }
  });

  // Define max score
  const maxScore = 10;

  // Set percentage
  const percentage = Math.floor((score / maxScore) * 100);

  // Set the value
  let value: PasswordStrengthValues;
  if (percentage > 80) value = "safe";
  else if (percentage > 70) value = "okay";
  else if (percentage > 50) value = "weak";
  else value = "compromised";

  // Set the color
  let color: PasswordStrengthColors;
  if (value === "safe") color = "--clr-safe";
  else if (value === "okay") color = "--clr-warn";
  else color = "--clr-danger";

  return {
    score,
    maxScore,
    percentage,
    color,
    suggestions,
    value,
    diversity,
    length,
  };
}

export type GetPasswordStrength = typeof calculateScore;

export default defineNuxtPlugin(() => ({
  provide: {
    getPasswordStrength: calculateScore,
  },
}));
