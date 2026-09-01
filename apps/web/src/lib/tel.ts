export function telHref(displayNumber: string): string {
  return `tel:${displayNumber.replaceAll(" ", "")}`;
}
