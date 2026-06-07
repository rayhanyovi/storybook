export function resolveImage(slot: string): string | null {
  if (/^(https?:|data:image\/)/.test(slot)) return slot;
  // DEMO-only: the product spec intentionally renders labeled placeholders.
  // REAL: this registry would map slots to generated art/CDN URLs.
  return null;
}
