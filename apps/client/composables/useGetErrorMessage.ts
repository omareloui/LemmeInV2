function isError(e: unknown): e is Error {
  return (
    typeof e === "object" &&
    !!e &&
    (e as Record<string, unknown>).name === "Error"
  );
}

export function useGetErrorMessage(e: unknown): string {
  if (isError(e)) return e.message;
  return "Can't extract error message";
}
