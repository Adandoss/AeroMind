export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Strip a leading "Module N:" prefix from stored module titles before re-labeling by order. */
export function stripModuleNumberPrefix(title: string): string {
  return title.replace(/^module\s+\d+:\s*/i, "");
}
