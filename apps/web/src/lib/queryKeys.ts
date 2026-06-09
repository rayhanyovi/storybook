export const queryKeys = {
  me: ['me'] as const,
  books: (params?: object) => ['books', params] as const,
  book: (id: string) => ['book', id] as const,
  bookContent: (id: string) => ['bookContent', id] as const,
  adminBookContent: (id: string) => ['adminBookContent', id] as const,
  library: ['library'] as const,
  bookRead: (id: string) => ['bookRead', id] as const,
  categories: ['categories'] as const
};
