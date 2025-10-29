/**
 * API Error Handler
 * Sesuai Integration Rules: Error Handling dengan format standar JSON
 */

export interface APIError {
  message: string;
  status?: number;
  detail?: string;
}

export class APIException extends Error {
  status?: number;
  detail?: string;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.name = "APIException";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Parse error dari berbagai format (FastAPI, fetch, dll)
 */
export function parseAPIError(error: unknown): APIError {
  // Error dari network/fetch
  if (error instanceof TypeError) {
    return {
      message: "Tidak dapat terhubung ke server. Pastikan backend berjalan.",
      status: 0,
    };
  }

  // Error dari APIException
  if (error instanceof APIException) {
    return {
      message: error.message,
      status: error.status,
      detail: error.detail,
    };
  }

  // Error standard
  if (error instanceof Error) {
    // Check apakah timeout
    if (error.message.includes("timeout")) {
      return {
        message: "Request timeout. Silakan coba lagi.",
        status: 408,
      };
    }

    // Check apakah abort
    if (error.message.includes("abort")) {
      return {
        message: "Request dibatalkan.",
        status: 499,
      };
    }

    return {
      message: error.message,
    };
  }

  // Unknown error
  return {
    message: "Terjadi kesalahan tidak diketahui. Silakan coba lagi.",
  };
}

/**
 * Format error message untuk user
 */
export function formatErrorMessage(error: unknown): string {
  const apiError = parseAPIError(error);

  if (apiError.detail) {
    return `${apiError.message}: ${apiError.detail}`;
  }

  return apiError.message;
}

/**
 * Check apakah error adalah network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }
  return false;
}

/**
 * Check apakah error adalah timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("timeout") || error.name === "AbortError";
  }
  return false;
}

/**
 * Retry helper untuk network errors
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Jangan retry jika bukan network error
      if (!isNetworkError(error) && !isTimeoutError(error)) {
        throw error;
      }

      // Tunggu sebelum retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
