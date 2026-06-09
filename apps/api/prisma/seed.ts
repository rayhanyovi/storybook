import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const storyTexts: Record<string, string[]> = {
  'goodnight-star': [
    'Little Star blinked awake as the sky turned soft and blue.',
    'The moon smiled gently and asked Little Star to shine for bedtime.',
    'Below the clouds, a sleepy child waved from a warm window.',
    'Little Star sprinkled tiny lights across the quiet room.',
    'The child yawned, hugged a pillow, and whispered goodnight.',
    'Little Star glowed softly until every dream felt safe and bright.'
  ],
  'counting-oyen': [
    'Oyen found one red ball beside the reading chair.',
    'Then two yellow socks tumbled out from under the blanket.',
    'Three little buttons rolled across the cozy rug.',
    'Four blue blocks stacked higher than Oyen could reach.',
    'Five storybooks waited in a neat little pile.',
    'Oyen counted them all, then picked the coziest book to read.'
  ],
  'brave-boat': [
    'A little paper boat floated out from a quiet puddle.',
    'The wind puffed softly and carried the boat toward a stream.',
    'Big ripples wobbled around it, but the boat kept going.',
    'A friendly frog showed the safest way around a stone.',
    'Rain tapped the water like tiny drums, and the boat sailed on.',
    'At sunset, the boat reached a pond full of golden light.',
    'The little boat felt proud of every brave splash.',
    'It rested by the reeds, ready for tomorrow.'
  ],
  'jungle-friends': [
    'Mina Monkey heard a tiny sneeze behind the big green leaves.',
    'Bimo Bird peeked down and saw Lala Lion cub looking lost.',
    'The jungle friends made a trail of bright flowers.',
    'Step by step, Lala followed the colors through the trees.',
    'Timo Turtle carried a snack for everyone to share.',
    'Soon they found Lala\'s family near the waterfall.',
    'The friends cheered, and the jungle felt warm again.',
    'That night, every leaf seemed to whisper thank you.'
  ],
  'lost-balloon': [
    'A pink balloon slipped from Nia\'s hand and floated up.',
    'Oyen looked at the sky and started a careful chase.',
    'The balloon bobbed past rooftops, kites, and sleepy clouds.',
    'A tall tree caught the string with one gentle branch.',
    'Oyen climbed just high enough to reach it safely.',
    'Nia hugged the balloon and tied it to her tiny wrist.',
    'Together they watched it dance, but never drift away.'
  ],
  'abc-garden': [
    'In the ABC garden, A grew beside a shiny apple.',
    'B buzzed with a busy bee around the blue flowers.',
    'C curled under a carrot leaf like a cozy caterpillar.',
    'D danced with daisies in the morning sun.',
    'Every letter had a sound, a shape, and a little surprise.',
    'Oyen watered the garden and sang the alphabet home.'
  ],
  'ocean-splash': [
    'Pip Penguin stepped into the waves with one tiny splash.',
    'A silver fish zipped by and invited Pip to follow.',
    'Blue bubbles rose like little round balloons.',
    'A gentle turtle showed Pip a garden of sea grass.',
    'The ocean hummed with shells, waves, and friendly whales.',
    'Pip learned that big water can still feel kind.',
    'At the shore, Pip waved goodbye to the sparkling sea.'
  ],
  'sleepy-moon-bear': [
    'Moon Bear carried a lantern through the quiet forest.',
    'Every paw step made the leaves rustle softly.',
    'The owl blinked twice and wished Moon Bear sweet dreams.',
    'A blanket of stars spread across the dark blue sky.',
    'Moon Bear found a cozy hill beside the silver moon.',
    'He closed his eyes while the forest tucked itself in.'
  ]
};

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

    const pageTexts = storyTexts[b.slug] ?? [];
    for (let i = 1; i <= b.pageCount; i++) {
      await prisma.bookPage.upsert({
        where: { bookId_index: { bookId: book.id, index: i } },
        update: {
          imageSlot: `book.page.${b.slug}.${i}`,
          text: pageTexts[i - 1] ?? `${b.title}, page ${i}.`
        },
        create: {
          bookId: book.id,
          index: i,
          imageSlot: `book.page.${b.slug}.${i}`,
          text: pageTexts[i - 1] ?? `${b.title}, page ${i}.`
        }
      });
    }
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
