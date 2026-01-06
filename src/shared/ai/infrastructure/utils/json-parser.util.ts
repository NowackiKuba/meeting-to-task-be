/**
 * Utility functions for resilient JSON parsing from AI responses
 */

/**
 * Extracts and cleans JSON from a potentially malformed response string.
 * Handles cases where the response contains markdown, extra text, or formatting.
 */
export function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // Find the first { and last } to extract JSON object
  const firstCurly = cleaned.indexOf('{');
  const lastCurly = cleaned.lastIndexOf('}');

  if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
    cleaned = cleaned.slice(firstCurly, lastCurly + 1);
  }

  // Fix common JSON issues
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*}/g, '}');
  cleaned = cleaned.replace(/,\s*]/g, ']');

  return cleaned.trim();
}

/**
 * Parses JSON with fallback recovery attempts.
 * Returns the parsed object or throws an error if all attempts fail.
 */
export function parseJsonWithFallback<T>(
  response: string,
  maxAttempts: number = 3,
): T {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // First attempt: direct parsing
      if (attempt === 1) {
        return JSON.parse(response.trim()) as T;
      }

      // Subsequent attempts: try with cleaning
      const cleaned = extractJsonFromResponse(response);
      return JSON.parse(cleaned) as T;
    } catch (error: any) {
      lastError = error;
      // If this is the last attempt, we'll throw
      if (attempt === maxAttempts) {
        break;
      }
    }
  }

  throw new Error(
    `Failed to parse JSON after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
  );
}

