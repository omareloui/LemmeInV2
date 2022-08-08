import type { ClientAccount as Account, PasswordStrengthValues } from "types";

export type DuplicatedPasswords = {
  [plainPassword: string]: { passwordsId: string[] };
};

export interface AnalyzeValue {
  counter: number;
  accounts: Account<"Native">[];
}

export type AnalyzeKeys = PasswordStrengthValues | "outdated" | "duplicated";

export type BuildAnalyzesOptions = {
  [key in AnalyzeKeys]: Account<"Native">[];
} & {
  totalAccounts: number;
};

export type Analyze = {
  [key in AnalyzeKeys]: AnalyzeValue;
} & {
  totalAccounts: number;
  score: number;
};
