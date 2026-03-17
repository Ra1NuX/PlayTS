/**
 * Shared error formatting utilities
 */

export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export function createErrorResult(error: unknown): { success: false; error: string } {
  return { success: false, error: formatError(error) };
}
