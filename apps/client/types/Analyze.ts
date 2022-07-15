import type { Account, PasswordStrengthValues } from "./Account";

export type DuplicatedPasswords = {
  [plainPassword: string]: { passwordsId: string[] };
};

export interface AnalyzeValue {
  counter: number;
  accounts: Account[];
}

export type AnalyzeKeys = PasswordStrengthValues | "outdated" | "duplicated";

export type BuildAnalyzesOptions = {
  [key in AnalyzeKeys]: Account[];
} & {
  totalAccounts: number;
};

export type Analyze = {
  [key in AnalyzeKeys]: AnalyzeValue;
} & {
  totalAccounts: number;
  score: number;
};
