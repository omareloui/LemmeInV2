interface RawError extends Error {
  name: "Error";
}

interface FetchError {
  name: "FetchError";
  message: string;
  response: {
    status: number;
    _data: {
      message: string;
      name: string;
      path: string;
      type: string;
      status: number;
    };
  };
}

export function useErrorParsers(e: unknown): RawError | FetchError {
  if (typeof e === "object" && e !== null) {
    const err = e as Record<string, unknown>;
    if (err.name === "Error") return err as unknown as RawError;
    if (err.name === "FetchError") return err as unknown as FetchError;
  }

  return new Error("Can't parse the error!") as RawError;
}
