export function toolText(text: string, isError = false) {
  return { isError, content: [{ type: 'text' as const, text }] };
}

export function toolError(error: unknown, fallback = 'Unexpected error') {
  const text = error instanceof Error ? error.message : fallback;
  return toolText(`${text.startsWith('Error:') ? text : `Error: ${text}`}`, true);
}
