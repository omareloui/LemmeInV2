import { defineStore, acceptHMRUpdate } from "pinia";
import {
  Analyze,
  AnalyzeKeys,
  Account,
  BuildAnalyzesOptions,
  DuplicatedPasswords,
  PasswordStrengthValues,
} from "~~/types";
import getDatePrevMonths from "~~/assets/utils/getDatePrevMonths";

export const useAnalyzeStore = defineStore("analyze", {
  state: () => ({
    duplicated: { counter: 0, accounts: [] as Account[] },
    outdated: { counter: 0, accounts: [] as Account[] },
    safe: { counter: 0, accounts: [] as Account[] },
    okay: { counter: 0, accounts: [] as Account[] },
    weak: { counter: 0, accounts: [] as Account[] },
    compromised: { counter: 0, accounts: [] as Account[] },
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
      this.duplicated = { counter: 0, accounts: [] as Account[] };
      this.outdated = { counter: 0, accounts: [] as Account[] };
      this.safe = { counter: 0, accounts: [] as Account[] };
      this.okay = { counter: 0, accounts: [] as Account[] };
      this.weak = { counter: 0, accounts: [] as Account[] };
      this.compromised = { counter: 0, accounts: [] as Account[] };
    },

    setAccountStrength({
      account,
      strength,
    }: {
      account: Account;
      strength: PasswordStrengthValues;
    }) {
      if (!account.isNative) return;
      const wantedStateStrength = this[strength];
      wantedStateStrength.accounts.push(account);
      wantedStateStrength.counter += 1;
      this.totalAccounts += 1;
    },

    updateAccountStrength({
      account,
      oldStrength,
      strength,
    }: {
      account: Account;
      oldStrength: PasswordStrengthValues;
      strength: PasswordStrengthValues;
    }) {
      if (!account.isNative || oldStrength === strength) return;
      // Remove from the old strength
      this[oldStrength].accounts = this[oldStrength].accounts.filter(
        x => x.id !== account.id,
      );
      this[oldStrength].counter -= 1;
      // Add to the new strength
      this[strength].accounts.push(account);
      this[strength].counter += 1;
    },

    setAsOutdated(account: Account) {
      const { outdated } = this;
      outdated.accounts.push(account);
      outdated.counter += 1;
    },

    setAsDuplicated({
      account,
      duplicatedWith,
    }: {
      account: Account;
      duplicatedWith: Account;
    }) {
      const { duplicated } = this;
      const alreadyExistingDuplication = duplicated.accounts.find(
        x => x.id === duplicatedWith.id,
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
      account: Account;
      strength: PasswordStrengthValues;
    }) {
      // Remove from its strength
      const wantedState = this[strength];
      const accountIndexToRemove = wantedState.accounts.findIndex(
        x => x.id === account.id,
      );
      if (accountIndexToRemove > -1) {
        wantedState.accounts.splice(accountIndexToRemove, 1);
        wantedState.counter -= 1;
      }

      // Remove from total counter
      this.totalAccounts -= 1;
    },

    removeFromOutdated(account: Account) {
      const accountIndexToRemove = this.outdated.accounts.findIndex(
        x => x.id === account.id,
      );
      if (accountIndexToRemove > -1) {
        this.outdated.accounts.splice(accountIndexToRemove, 1);
        this.outdated.counter -= 1;
      }
    },

    removeFromDuplicated(account: Account) {
      const accountToRemove = this.duplicated.accounts.find(
        x => x.id === account.id,
      );
      if (accountToRemove) {
        const allSamePasswordAccounts = this.duplicated.accounts.filter(
          x => x.password === accountToRemove.password,
        );

        // Remove the only provided account if it's duplicated with more than one account
        if (allSamePasswordAccounts.length > 2) {
          this.duplicated.accounts = this.duplicated.accounts.filter(
            x => x.id !== account.id,
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
      const { accounts } = this.app.$accessor.vault;
      const analyzed = {
        compromised: [],
        okay: [],
        safe: [],
        weak: [],
        duplicated: [],
        outdated: [],
        totalAccounts: accounts.length,
      } as BuildAnalyzesOptions;

      const nativeAccounts = accounts.filter(x => x.isNative);

      const duplications = await this.setDuplicatedPasswords(nativeAccounts);

      const checkIfDuplicated = (account: Account) =>
        duplications[account.password as string].passwordsId.length > 1;
      const checkIfOutdated = (account: Account) =>
        Number(account.lastPasswordUpdate) <=
        Number(getDatePrevMonths(this.MAX_OUTDATED_MONTHS));

      const checkForStrength = (
        account: Account,
        strength: PasswordStrengthValues,
      ) =>
        this.app.$getPasswordStrength(account.password as string).value ===
        strength;

      const checkIfSafe = (account: Account) =>
        checkForStrength(account, "safe");
      const checkIfOkay = (account: Account) =>
        checkForStrength(account, "okay");
      const checkIfWeak = (account: Account) =>
        checkForStrength(account, "weak");
      const checkIfCompromised = (account: Account) =>
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

    setDuplicatedPasswords(accounts: Account[]) {
      const setDuplicatedPasswords = (
        prev: DuplicatedPasswords,
        cur: Account,
      ) => {
        if (!cur.isNative) return prev;
        const pass = cur.password as string;
        const currentPasswordsIds = prev[pass]?.passwordsId;
        // eslint-disable-next-line no-param-reassign
        prev[pass] = {
          passwordsId: currentPasswordsIds
            ? [...currentPasswordsIds, cur.id.toString()]
            : [cur.id.toString()],
        };
        return prev;
      };
      return accounts.reduce(setDuplicatedPasswords, {});
    },

    calculateScore() {
      const { safe, okay, weak, compromised, outdated, duplicated } = state;
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

    addAccount(account: Account) {
      if (!account.isNative) return;
      // Set its strength
      const pass = account.password as string;
      const strength = this.$getPasswordStrength(pass).value;
      this.setAccountStrength({ account, strength });
      // Set if it's outdated
      const maxOldDate = getDatePrevMonths(state.MAX_OUTDATED_MONTHS);
      if (account.lastPasswordUpdate < maxOldDate) this.setAsOutdated(account);
      // Set if duplicated
      const duplicatedWith = this.app.$accessor.vault.accounts.find(
        x =>
          x.isNative && x.id !== account.id && x.password === account.password,
      );
      if (duplicatedWith) this.setAsDuplicated({ account, duplicatedWith });
      // Recalculate the score
      this.calculateScore();
    },

    editAccount(account: Account) {
      if (!account.isNative) {
        this.removeFromAllWithId(account.id);
        return;
      }
      const findAccount = (x: Account) => x.id === account.id;
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
      const strength = this.$getPasswordStrength(account.password as string);
      // If there wasn't an old account (meaning it changed from oAuth to native)
      //  then add it as a new one
      if (!oldAccount)
        this.setAccountStrength({ account, strength: strength.value });
      // Else update it
      else
        this.updateAccountStrength({
          account,
          strength: strength.value,
          oldStrength,
        });

      // Remove from outdated if need be
      if (
        account.lastPasswordUpdate < getDatePrevMonths(this.MAX_OUTDATED_MONTHS)
      )
        this.removeFromOutdated(account);

      // Duplicated
      this.removeFromDuplicated(account);
      const duplicatedWith = this.app.$accessor.vault.accounts.find(
        x =>
          x.isNative && x.id !== account.id && x.password === account.password,
      );
      if (duplicatedWith) this.setAsDuplicated({ account, duplicatedWith });

      // Recalculate the score
      this.calculateScore();
    },

    removeAccount(account: Account) {
      if (!account.isNative) return;
      this.removeFromAll(account);
      this.calculateScore();
    },

    removeFromAll(account: Account) {
      if (!account.isNative) return;
      const strength = this.$getPasswordStrength(account.password as string);
      this.removeFromStrength({ account, strength: strength.value });
      this.removeFromDuplicated(account);
      this.removeFromOutdated(account);
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
      ].find(x => x.id === accountId);
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
