import { defineStore, acceptHMRUpdate } from "pinia";

import { useVaultStore } from "store/useVault";

import getDatePrevMonths from "~~/assets/utils/getDatePrevMonths";
import type {
  Analyze,
  AnalyzeKeys,
  ClientAccount as Account,
  BuildAnalyzesOptions,
  DuplicatedPasswords,
  PasswordStrengthValues,
} from "~~/types";

export const useAnalyzeStore = defineStore("analyze", {
  state: () => ({
    duplicated: { counter: 0, accounts: [] as Account<"Native">[] },
    outdated: { counter: 0, accounts: [] as Account<"Native">[] },
    safe: { counter: 0, accounts: [] as Account<"Native">[] },
    okay: { counter: 0, accounts: [] as Account<"Native">[] },
    weak: { counter: 0, accounts: [] as Account<"Native">[] },
    compromised: { counter: 0, accounts: [] as Account<"Native">[] },
    totalAccounts: 0,
    score: 0,

    MAX_OUTDATED_MONTHS: 3,
  }),

  actions: {
    setData(data: Omit<Analyze, "score">) {
      (Object.keys(data) as AnalyzeKeys[]).forEach(key => {
        this[key] = data[key];
      });
    },

    clearData(this) {
      this.duplicated = { counter: 0, accounts: [] };
      this.outdated = { counter: 0, accounts: [] };
      this.safe = { counter: 0, accounts: [] };
      this.okay = { counter: 0, accounts: [] };
      this.weak = { counter: 0, accounts: [] };
      this.compromised = { counter: 0, accounts: [] };
    },

    setAccountStrength({
      account,
      strength,
    }: {
      account: Account<"Native">;
      strength: PasswordStrengthValues;
    }) {
      const wantedStateStrength = this[strength];
      wantedStateStrength.accounts.push(account as Account<"Native">);
      wantedStateStrength.counter += 1;
      this.totalAccounts += 1;
    },

    updateAccountStrength({
      account,
      oldStrength,
      strength,
    }: {
      account: Account<"Native">;
      oldStrength: PasswordStrengthValues;
      strength: PasswordStrengthValues;
    }) {
      if (oldStrength === strength) return;
      // Remove from the old strength
      this[oldStrength].accounts = this[oldStrength].accounts.filter(
        x => x._id !== account._id,
      );
      this[oldStrength].counter -= 1;
      // Add to the new strength
      this[strength].accounts.push(account);
      this[strength].counter += 1;
    },

    setAsOutdated(account: Account<"Native">) {
      const { outdated } = this;
      outdated.accounts.push(account);
      outdated.counter += 1;
    },

    setAsDuplicated({
      account,
      duplicatedWith,
    }: {
      account: Account<"Native">;
      duplicatedWith: Account<"Native">;
    }) {
      const { duplicated } = this;
      const alreadyExistingDuplication = duplicated.accounts.find(
        x => x._id === duplicatedWith._id,
      );
      if (!alreadyExistingDuplication) {
        duplicated.accounts.push(duplicatedWith);
        duplicated.counter += 1;
      }
      duplicated.accounts.push(account);
      duplicated.counter += 1;
    },

    setScore(score: number) {
      if (score >= 0 && score <= 100) this.score = score;
    },

    removeFromStrength({
      account,
      strength,
    }: {
      account: Account<"Native">;
      strength: PasswordStrengthValues;
    }) {
      // Remove from its strength
      const wantedState = this[strength];
      const accountIndexToRemove = wantedState.accounts.findIndex(
        x => x._id === account._id,
      );
      if (accountIndexToRemove > -1) {
        wantedState.accounts.splice(accountIndexToRemove, 1);
        wantedState.counter -= 1;
      }

      // Remove from total counter
      this.totalAccounts -= 1;
    },

    removeFromOutdated(account: Account<"Native">) {
      const accountIndexToRemove = this.outdated.accounts.findIndex(
        x => x._id === account._id,
      );
      if (accountIndexToRemove > -1) {
        this.outdated.accounts.splice(accountIndexToRemove, 1);
        this.outdated.counter -= 1;
      }
    },

    removeFromDuplicated(account: Account<"Native">) {
      const accountToRemove = this.duplicated.accounts.find(
        x => x._id === account._id,
      );
      if (accountToRemove) {
        const allSamePasswordAccounts = this.duplicated.accounts.filter(
          x => x.password === accountToRemove.password,
        );

        // Remove the only provided account if it's duplicated with more than one account
        if (allSamePasswordAccounts.length > 2) {
          this.duplicated.accounts = this.duplicated.accounts.filter(
            x => x._id !== account._id,
          );
          this.duplicated.counter -= 1;
        }

        // Remove both if they're only the duplicated
        if (allSamePasswordAccounts.length === 2) {
          this.duplicated.accounts = this.duplicated.accounts.filter(
            x => x.password !== accountToRemove.password,
          );
          this.duplicated.counter -= 2;
        }
      }
    },

    async init() {
      const vaultStore = useVaultStore();
      const { $getPasswordStrength } = useNuxtApp();
      const analyzed = {
        compromised: [],
        okay: [],
        safe: [],
        weak: [],
        duplicated: [],
        outdated: [],
        totalAccounts: vaultStore.accounts.length,
      } as BuildAnalyzesOptions;

      const nativeAccounts = vaultStore.accounts.filter(
        x => x.kind === "Native",
      ) as Account<"Native">[];

      const duplications = await this.setDuplicatedPasswords(nativeAccounts);

      const checkIfDuplicated = (account: Account<"Native">) =>
        duplications[account.password as string].passwordsId.length > 1;
      const checkIfOutdated = (account: Account<"Native">) =>
        Number(account.lastPasswordUpdate) <=
        Number(getDatePrevMonths(this.MAX_OUTDATED_MONTHS));

      const checkForStrength = (
        account: Account<"Native">,
        strength: PasswordStrengthValues,
      ) => $getPasswordStrength(account.password as string).value === strength;

      const checkIfSafe = (account: Account<"Native">) =>
        checkForStrength(account, "safe");
      const checkIfOkay = (account: Account<"Native">) =>
        checkForStrength(account, "okay");
      const checkIfWeak = (account: Account<"Native">) =>
        checkForStrength(account, "weak");
      const checkIfCompromised = (account: Account<"Native">) =>
        checkForStrength(account, "compromised");

      analyzed.duplicated = nativeAccounts.filter(checkIfDuplicated);
      analyzed.outdated = nativeAccounts.filter(checkIfOutdated);

      analyzed.safe = nativeAccounts.filter(checkIfSafe);
      analyzed.okay = nativeAccounts.filter(checkIfOkay);
      analyzed.weak = nativeAccounts.filter(checkIfWeak);
      analyzed.compromised = nativeAccounts.filter(checkIfCompromised);

      const analyzeResult = (await this.buildResult(analyzed)) as Omit<
        Analyze,
        "score"
      >;
      this.setData(analyzeResult);
      this.calculateScore();
    },

    setDuplicatedPasswords(accounts: Account<"Native" | "OAuthed">[]) {
      const setDuplicatedPasswords = (
        prev: DuplicatedPasswords,
        cur: Account<"Native" | "OAuthed">,
      ) => {
        if (cur.kind && cur.kind === "OAuthed") return prev;
        const pass = cur.password as string;
        const currentPasswordsIds = prev[pass]?.passwordsId;
        // eslint-disable-next-line no-param-reassign
        prev[pass] = {
          passwordsId: currentPasswordsIds
            ? [...currentPasswordsIds, cur._id.toString()]
            : [cur._id.toString()],
        };
        return prev;
      };
      return accounts.reduce(setDuplicatedPasswords, {});
    },

    calculateScore() {
      const { safe, okay, weak, compromised, outdated, duplicated } = this;
      let totalScore = 0;
      const safeLength = safe.counter;
      const okayLength = okay.counter;
      const weakLength = weak.counter;
      const compromisedLength = compromised.counter;
      const nonOAuthAccountsTotal =
        safeLength + okayLength + weakLength + compromisedLength;
      // Each account could be only one of these
      totalScore += safeLength;
      totalScore += okayLength * 0.75;
      totalScore += weakLength * 0.5;
      totalScore += compromisedLength * 0;
      // But there are sub categories the account could have it with any other
      // strength value
      totalScore -= outdated.accounts.length * 0.5;
      totalScore -= duplicated.accounts.length * 0.5;
      this.setScore(Math.floor((totalScore / nonOAuthAccountsTotal) * 100));
    },

    addAccount(account: Account<"Native" | "OAuthed">) {
      const { $getPasswordStrength } = useNuxtApp();
      const vaultStore = useVaultStore();
      if (account.kind === "OAuthed") return;
      // Set its strength
      const pass = account.password as string;
      const strength = $getPasswordStrength(pass).value;
      this.setAccountStrength({
        account: account as Account<"Native">,
        strength,
      });
      // Set if it's outdated
      const maxOldDate = getDatePrevMonths(this.MAX_OUTDATED_MONTHS);
      if (account.lastPasswordUpdate < maxOldDate)
        this.setAsOutdated(account as Account<"Native">);
      // Set if duplicated
      const duplicatedWith = vaultStore.accounts.find(
        x =>
          x.kind === "Native" &&
          x._id !== account._id &&
          x.password === account.password,
      );
      if (duplicatedWith)
        this.setAsDuplicated({
          account: account as Account<"Native">,
          duplicatedWith: duplicatedWith as Account<"Native">,
        });
      // Recalculate the score
      this.calculateScore();
    },

    editAccount(account: Account<"Native" | "OAuthed">) {
      const { $getPasswordStrength } = useNuxtApp();
      const vaultStore = useVaultStore();
      if (account.kind === "OAuthed") {
        this.removeFromAllWithId(account._id);
        return;
      }
      const findAccount = (x: Account<"Native">) => x._id === account._id;
      // Get the account and its old strength
      let oldStrength = "safe" as PasswordStrengthValues;
      let oldAccount = this.safe.accounts.find(findAccount);
      if (!oldAccount) {
        oldAccount = this.okay.accounts.find(findAccount);
        oldStrength = "okay";
      }
      if (!oldAccount) {
        oldAccount = this.weak.accounts.find(findAccount);
        oldStrength = "weak";
      }
      if (!oldAccount) {
        oldAccount = this.compromised.accounts.find(findAccount);
        oldStrength = "compromised";
      }

      // Update its strength
      const strength = $getPasswordStrength(account.password as string);
      // If there wasn't an old account (meaning it changed from oAuth to native)
      //  then add it as a new one
      if (!oldAccount)
        this.setAccountStrength({
          account: account as Account<"Native">,
          strength: strength.value,
        });
      // Else update it
      else
        this.updateAccountStrength({
          account: account as Account<"Native">,
          strength: strength.value,
          oldStrength,
        });

      // Remove from outdated if need be
      if (
        account.lastPasswordUpdate < getDatePrevMonths(this.MAX_OUTDATED_MONTHS)
      )
        this.removeFromOutdated(account as Account<"Native">);

      // Duplicated
      this.removeFromDuplicated(account as Account<"Native">);
      const duplicatedWith = vaultStore.accounts.find(
        x =>
          x.kind === "Native" &&
          x._id !== account._id &&
          x.password === account.password,
      );
      if (duplicatedWith)
        this.setAsDuplicated({
          account: account as Account<"Native">,
          duplicatedWith: duplicatedWith as Account<"Native">,
        });

      // Recalculate the score
      this.calculateScore();
    },

    removeAccount(account: Account<"Native" | "OAuthed">) {
      if (account.kind === "OAuthed") return;
      this.removeFromAll(account);
      this.calculateScore();
    },

    removeFromAll(account: Account<"Native" | "OAuthed">) {
      if (account.kind === "OAuthed") return;
      const { $getPasswordStrength } = useNuxtApp();
      const strength = $getPasswordStrength(account.password as string);
      this.removeFromStrength({
        account: account as Account<"Native">,
        strength: strength.value,
      });
      this.removeFromDuplicated(account as Account<"Native">);
      this.removeFromOutdated(account as Account<"Native">);
    },

    async removeFromAllWithId(accountId: string) {
      const account = await this.getCurrentAccount(accountId);
      if (!account) return;
      this.removeFromAll(account);
    },

    getCurrentAccount(accountId: string) {
      return [
        ...this.safe.accounts,
        ...this.okay.accounts,
        ...this.weak.accounts,
        ...this.compromised.accounts,
      ].find(x => x._id === accountId);
    },

    buildResult({
      totalAccounts,
      duplicated,
      outdated,
      compromised,
      weak,
      okay,
      safe,
    }: BuildAnalyzesOptions): Omit<Analyze, "score"> {
      return {
        duplicated: {
          counter: duplicated.length,
          accounts: duplicated,
        },
        outdated: {
          counter: outdated.length,
          accounts: outdated,
        },
        compromised: {
          counter: compromised.length,
          accounts: compromised,
        },
        weak: {
          counter: weak.length,
          accounts: weak,
        },
        okay: {
          counter: okay.length,
          accounts: okay,
        },
        safe: {
          counter: safe.length,
          accounts: safe,
        },
        totalAccounts,
      };
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAnalyzeStore, import.meta.hot));
