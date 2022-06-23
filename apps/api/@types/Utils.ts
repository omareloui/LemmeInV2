export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ReplaceType<T, K extends keyof T, NT> = Omit<T, K> & Record<K, NT>;
export type ReplaceProperty<T, K extends keyof T, NP extends string> = Omit<
  T,
  K
> &
  Record<NP, T[K]>;
