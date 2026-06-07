import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password', 10);

  const parent = await prisma.user.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      email: 'parent@demo.com',
      passwordHash,
      role: 'USER',
      onboardingCompletedAt: null,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      onboardingCompletedAt: new Date(),
    },
  });

  const bedtime = await prisma.category.upsert({
    where: { slug: 'bedtime' },
    update: {},
    create: { name: 'Bedtime', slug: 'bedtime' },
  });
  const adventure = await prisma.category.upsert({
    where: { slug: 'adventure' },
    update: {},
    create: { name: 'Adventure', slug: 'adventure' },
  });
  const learning = await prisma.category.upsert({
    where: { slug: 'learning' },
    update: {},
    create: { name: 'Learning', slug: 'learning' },
  });
  const animals = await prisma.category.upsert({
    where: { slug: 'animals' },
    update: {},
    create: { name: 'Animals', slug: 'animals' },
  });

  const books = [
    { slug: 'goodnight-star',  title: 'Goodnight Little Star', author: 'Storybook', priceCents: 0,     status: 'PUBLISHED' as const, category: bedtime,   pageCount: 6 },
    { slug: 'counting-oyen',   title: 'Counting with Oyen',    author: 'Storybook', priceCents: 0,     status: 'PUBLISHED' as const, category: learning,  pageCount: 6 },
    { slug: 'brave-boat',      title: 'The Brave Little Boat', author: 'Storybook', priceCents: 15000, status: 'PUBLISHED' as const, category: adventure, pageCount: 8 },
    { slug: 'jungle-friends',  title: 'Jungle Friends',        author: 'Storybook', priceCents: 20000, status: 'PUBLISHED' as const, category: animals,   pageCount: 8 },
    { slug: 'lost-balloon',    title: 'The Lost Balloon',      author: 'Storybook', priceCents: 18000, status: 'PUBLISHED' as const, category: adventure, pageCount: 7 },
    { slug: 'abc-garden',      title: 'ABC Garden',            author: 'Storybook', priceCents: 22000, status: 'PUBLISHED' as const, category: learning,  pageCount: 6 },
    { slug: 'ocean-splash',    title: 'Ocean Splash',          author: 'Storybook', priceCents: 20000, status: 'PUBLISHED' as const, category: animals,   pageCount: 7 },
    { slug: 'sleepy-moon-bear',title: 'Sleepy Moon Bear',      author: 'Storybook', priceCents: 25000, status: 'ARCHIVED' as const,  category: bedtime,   pageCount: 6 },
  ];

  const createdBooks: Record<string, { id: string }> = {};

  for (const b of books) {
    const book = await prisma.book.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        slug: b.slug,
        title: b.title,
        author: b.author,
        description: '',
        coverSlot: `book.cover.${b.slug}`,
        priceCents: b.priceCents,
        currency: 'IDR',
        ageMin: 0,
        ageMax: 12,
        pageCount: b.pageCount,
        status: b.status,
        categories: { connect: [{ id: b.category.id }] },
      },
    });
    createdBooks[b.slug] = book;
  }

  // parent@demo owns Sleepy Moon Bear (ARCHIVED)
  const sleepyMoonBear = createdBooks['sleepy-moon-bear'];
  await prisma.purchase.upsert({
    where: { userId_bookId: { userId: parent.id, bookId: sleepyMoonBear.id } },
    update: {},
    create: {
      userId: parent.id,
      bookId: sleepyMoonBear.id,
      pricePaidCents: 25000,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
