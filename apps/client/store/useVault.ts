import { defineStore, acceptHMRUpdate } from "pinia";

import { take } from "lodash";

import { AddAccount, Account, UpdateAccount, Optional } from "~~/@types";

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
      const { data } = await this.$axios.get("/accounts");
      const accounts = data as Account[];
      this.decryptAndSetAccounts(accounts);
    },

    async getAccounts() {
      if (!this.app.$accessor.auth.isSigned) return;
      this.updateAccountsCache();
    },

    async getAccount(accountId: string): Promise<Account> {
      try {
        // Check first from cache
        let acc = this.accounts.find(x => x.id === accountId);
        // Get the account if not in cache
        if (!acc) {
          const { data } = await this.$axios.get(`/accounts/${accountId}`);
          const account = data as Account;
          acc = await this.decryptAccount(account);
        }
        if (!acc) throw new Error("Can't find the account");
        return acc;
      } catch (e) {
        // @ts-ignore
        return this.$notify.error(e.response.data.message);
      }
    },

    async addAccount(options: AddAccount) {
      await this.encryptAccount(options);
      const { data } = await this.$axios.post("/accounts", options);
      const account = (await this.decryptAccount(data)) as Account;
      await this.app.$accessor.analyze.addAccount(account);
      this.$notify.success("Created account.");
      this.unshiftToAccounts(account);
    },

    async editAccount(options: UpdateAccount) {
      const { id } = options;
      const optionsForRequest = options as Optional<UpdateAccount, "id">;
      delete (optionsForRequest as { id?: string }).id;
      await this.encryptAccount(optionsForRequest);
      const { data } = await this.$axios.put(
        `/accounts/${id}`,
        optionsForRequest,
      );
      const newAccount = (await this.decryptAccount(data)) as Account;
      await this.app.$accessor.analyze.editAccount(newAccount);
      this.updateAccountCache(newAccount);
      this.$notify.success("Updated account.");
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
      try {
        const confirmed = await this.$confirm(
          `Are you sure you want to delete "${accountName}" account?`,
          { acceptMessage: "Delete" },
        );
        if (!confirmed) return;
        await this.$axios.delete(`/accounts/${accountId}`);

        const account = await this.getAccount(accountId);
        await this.app.$accessor.analyze.removeAccount(account);

        this.removeAccount(accountId);
        this.$notify.success("Deleted account successfully");
        if (goToVaultAfter) this.$router.push("/vault");
      } catch (e) {
        // @ts-ignore
        throw new Error(e.response.data.message);
      }
    },

    async decryptAccount(account: Account): Promise<Account> {
      const acc = account;
      acc.app = await this.app.$cypher.decrypt(acc.app);
      acc.accountIdentifier =
        acc.accountIdentifier &&
        (await this.app.$cypher.decrypt(acc.accountIdentifier));
      acc.site = acc.site && (await this.app.$cypher.decrypt(acc.site));
      acc.note = acc.note && (await this.app.$cypher.decrypt(acc.note));

      if (acc.isNative)
        acc.password = await this.app.$cypher.decrypt(acc.password as string);
      else acc.password = await this.decryptAccount(acc.password);

      return acc;
    },

    async encryptAccount(account: Account): Promise<Account> {
      const acc = account;
      acc.app = await this.app.$cypher.encrypt(acc.app);
      if (acc.isNative)
        acc.password = await this.app.$cypher.encrypt(acc.password as string);
      acc.accountIdentifier =
        acc.accountIdentifier &&
        (await this.app.$cypher.encrypt(acc.accountIdentifier));
      acc.site = acc.site && (await this.app.$cypher.encrypt(acc.site));
      acc.note = acc.note && (await this.app.$cypher.encrypt(acc.note));
      return acc;
    },

    async updateLastUsed(accountId: string) {
      await this.$axios.put(`/accounts/${accountId}/last-used`);
      this.updateLastUsedCache(accountId);
    },

    async copy(accountId: string) {
      // Get the account
      const acc = (await this.getAccount(accountId)) as Account;
      if (!acc || !acc.isNative) return;
      // Update it's last used
      await this.updateLastUsed(accountId);
      // Copy the account
      this.$copy(acc.password as string, "Copied password!");
    },

    async decryptAndSetAccounts(accounts: Account[]) {
      const dAccounts = await Promise.all(
        accounts.map(x => this.decryptAccount(x)),
      );
      this.setAccounts(dAccounts);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useVaultStore, import.meta.hot));
