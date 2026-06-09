export function resolveImage(slot: string): string | null {
  if (/^(https?:|data:image\/)/.test(slot)) return slot;

  const direct: Record<string, string> = {
    'mascot.login-welcome': '/illustration/1.png',
    'mascot.onboarding': '/illustration/6.png',
    'mascot.empty-library': '/illustration/7.png',
    'mascot.loading': '/illustration/2.png',
    'mascot.reward': '/illustration/9.png',
    'mascot.locked': '/illustration/10.png',
    'mascot.404': '/illustration/11.png',
    'mascot.error': '/illustration/12.png',
    'mascot.bedtime': '/illustration/13.png',
    'hero.home': '/illustration/15.png',
    'hero.subscribe': '/illustration/treasure.png',
    'avatar.parent': '/illustration/parent_avatar.png',
    'avatar.kid': '/illustration/child_avatar.png',
    'avatar.admin': '/illustration/admin_avatar.png',

    'book.cover.goodnight-star': '/illustration/books/goodnight_little_star_cover.png',
    'book.cover.counting-oyen': '/illustration/books/oyen_counting_cover.png',
    'book.cover.brave-boat': '/illustration/books/brave_boat_cover.png',
    'book.cover.jungle-friends': '/illustration/books/jungle_adventure_cover.png',
  };

  if (direct[slot]) return direct[slot];

  const pageMatch = slot.match(/^book\.page\.([a-z0-9-]+)\.(\d+)$/);
  if (!pageMatch) return null;

  const [, slug, rawIndex] = pageMatch;
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 1 || index > 6) return null;

  const pagePrefixes: Record<string, string> = {
    'goodnight-star': 'goodnight_little_star',
    'counting-oyen': 'oyen_counting',
    'brave-boat': 'brave_boat',
    'jungle-friends': 'jungle_adventure',
  };

  const prefix = pagePrefixes[slug];
  return prefix ? `/illustration/books/${prefix}_${index}.png` : null;
}
