export async function nullishOrFail<T>(
  resultPromise: Promise<T | T[] | undefined | null>,
  error: Error,
): Promise<void> {
  const result = await resultPromise;
  if (
    (result && !Array.isArray(result)) ||
    (Array.isArray(result) && result.length > 0)
  ) {
    throw error;
  }
}

