import { defineStore, acceptHMRUpdate } from "pinia";

import _ from "lodash";

import { useAuthStore } from "store/useAuth";
import { useAnalyzeStore } from "store/useAnalyze";

import { AddAccount, Account, UpdateAccount, Optional } from "~~/types";

const { take } = _;

export const useVaultStore = defineStore("vault", {
  state: () => ({
    accounts: [] as Account[],
  }),

  getters: {
    recentlyUsed(state) {
      // This won't update with the state 'cause of the cloning
      // Note that the icon is the only thing showing from this so
      //   it's not that important
      return take(
        state.accounts
          .filter(x => x.lastUsed)
          .sort(
            (a, b) =>
              Number(new Date(b.lastUsed || 0)) -
              Number(new Date(a.lastUsed || 0)),
          ),
        15,
      );
    },

    newlyAdded(state) {
      // FIXME: this won't update with the state 'cause of the cloning
      return take(
        [...state.accounts].sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt),
        ),
        15,
      );
    },
  },

  actions: {
    setAccounts(accounts: Account[]) {
      this.accounts = accounts;
    },

    clearAccounts() {
      this.accounts = [];
    },

    unshiftToAccounts(account: Account) {
      this.accounts.unshift(account);
    },

    updateLastUsedCache(accountId: string) {
      if (this.accounts.length === 0) return;
      const account = this.accounts.find(x => x.id === accountId);
      if (!account)
        throw new Error("Can't find the account to update last used");
      account.lastUsed = new Date();
    },

    removeAccount(accountId: string) {
      this.accounts = this.accounts.filter(x => x.id !== accountId);
    },

    updateAccountCache(account: Account) {
      const accIndex = this.accounts.findIndex(x => x.id === account.id);
      if (accIndex === -1)
        throw new Error("Can't find the account to update last used");
      this.accounts[accIndex] = account;
    },

    removeTagFromAccounts(tagId: string) {
      this.accounts = this.accounts.map(acc => {
        if (acc.tags && acc.tags.length > 0)
          acc.tags = acc.tags.filter(x => x.id !== tagId);
        return acc;
      });
    },

    async updateAccountsCache() {
      const accounts = (await useServerFetch("/accounts")) as Account[];
      this.decryptAndSetAccounts(accounts);
    },

    getAccounts() {
      const authStore = useAuthStore();
      if (!authStore.isSigned) return;
      this.updateAccountsCache();
    },

    async getAccount(accountId: string) {
      const { $notify } = useNuxtApp();
      try {
        // Check first from cache
        let acc = this.accounts.find(x => x.id === accountId);
        // Get the account if not in cache
        if (!acc) {
          const account = (await useServerFetch(
            `/accounts/${accountId}`,
          )) as Account;
          acc = this.decryptAccount(account);
        }
        if (!acc) throw new Error("Can't find the account");
        return acc;
      } catch (e) {
        $notify.error(useGetErrorMessage(e));
        return false;
      }
    },

    async addAccount(options: AddAccount) {
      const { $notify } = useNuxtApp();
      const analyzeStore = useAnalyzeStore();
      await this.encryptAccount(options);
      const account = (await useServerFetch("/accounts", {
        method: "POST",
        body: options,
      })) as Account;
      await analyzeStore.addAccount(account);
      $notify.success("Created account.");
      this.unshiftToAccounts(account);
    },

    async editAccount(options: UpdateAccount) {
      const { $notify } = useNuxtApp();
      const analyzeStore = useAnalyzeStore();
      const { id } = options;
      const optionsForRequest = options as Optional<UpdateAccount, "id">;
      delete (optionsForRequest as { id?: string }).id;
      await this.encryptAccount(optionsForRequest);
      const updatedAccount = (await useServerFetch(`/accounts/${id}`, {
        method: "PUT",
        body: optionsForRequest,
      })) as Account;
      const newAccount = this.decryptAccount(updatedAccount);
      await analyzeStore.editAccount(newAccount);
      this.updateAccountCache(newAccount);
      $notify.success("Updated account.");
      return newAccount;
    },

    async deleteAccount({
      accountId,
      accountName,
      goToVaultAfter = true,
    }: {
      accountId: string;
      accountName: string;
      goToVaultAfter?: boolean;
    }) {
      const { $notify, $confirm } = useNuxtApp();
      try {
        const analyzeStore = useAnalyzeStore();
        const router = useRouter();
        const confirmed = await $confirm(
          `Are you sure you want to delete "${accountName}" account?`,
          { acceptMessage: "Delete" },
        );
        if (!confirmed) return;
        await useServerFetch(`/accounts/${accountId}`, { method: "DELETE" });

        const account = await this.getAccount(accountId);
        await analyzeStore.removeAccount(account as Account);

        this.removeAccount(accountId);
        $notify.success("Deleted account successfully");
        if (goToVaultAfter) router.push("/vault");
      } catch (e) {
        $notify.error(useGetErrorMessage(e));
      }
    },

    decryptAccount<T extends Account>(account: T): T {
      const { $cypher } = useNuxtApp();
      const acc = { ...account };
      acc.app = $cypher.decrypt(acc.app)!;
      acc.accountIdentifier =
        acc.accountIdentifier && $cypher.decrypt(acc.accountIdentifier);
      acc.site = acc.site && $cypher.decrypt(acc.site);
      acc.note = acc.note && $cypher.decrypt(acc.note);

      if (acc.isNative) acc.password = $cypher.decrypt(acc.password as string)!;
      else acc.password = this.decryptAccount(acc.password as Account);

      return acc;
    },

    encryptAccount<T extends Account | AddAccount>(account: T): T {
      const { $cypher } = useNuxtApp();
      const acc = account;
      acc.app = $cypher.encrypt(acc.app)!;
      if (acc.isNative) acc.password = $cypher.encrypt(acc.password as string)!;
      acc.accountIdentifier =
        acc.accountIdentifier && $cypher.encrypt(acc.accountIdentifier);
      acc.site = acc.site && $cypher.encrypt(acc.site);
      acc.note = acc.note && $cypher.encrypt(acc.note);
      return acc;
    },

    async updateLastUsed(accountId: string) {
      await useServerFetch(`/accounts/${accountId}/last-used`, {
        method: "PUT",
      });
      this.updateLastUsedCache(accountId);
    },

    async copy(accountId: string) {
      const { $copy } = useNuxtApp();
      // Get the account
      const acc = (await this.getAccount(accountId)) as Account;
      if (!acc || !acc.isNative) return;
      // Update it's last used
      await this.updateLastUsed(accountId);
      // Copy the account
      $copy(acc.password as string, "Copied password!");
    },

    decryptAndSetAccounts(accounts: Account[]) {
      const dAccounts = accounts.map(x => this.decryptAccount(x));
      this.setAccounts(dAccounts);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useVaultStore, import.meta.hot));
