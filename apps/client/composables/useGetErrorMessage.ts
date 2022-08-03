export function useGetErrorMessage(e: unknown): string {
  const err = useErrorParsers(e);
  if (err.name === "FetchError") return err.response._data.message;
  return err.message;
}
