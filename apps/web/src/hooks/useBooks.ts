import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminBookContentDTO, BookWithAccess, BookDTO, BookContent, CategoryDTO } from '@storybook/shared';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export type BookWithTracking = BookWithAccess & {
  currentPage: number;
  readCount: number;
  lastReadAt: string | null;
};

export type ReadingProgressItem = {
  book: BookDTO;
  currentPage: number;
  readCount: number;
  lastReadAt: string;
};

export interface LibraryResponse {
  subscription: { status: string; expiresAt: string } | null;
  owned: BookDTO[];
  readingProgress: ReadingProgressItem[];
  favoriteBooks: ReadingProgressItem[];
  hasActiveSub: boolean;
}

interface BooksResponse { data: BookWithTracking[]; page: number; limit: number; total: number; }
interface BooksParams { category?: string; page?: number; limit?: number; q?: string; }

export function useBooks(params?: BooksParams) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
  ).toString();
  return useQuery<BooksResponse>({
    queryKey: queryKeys.books(params),
    queryFn: () => api.get<BooksResponse>(`/books${qs ? `?${qs}` : ''}`)
  });
}

export function useBook(id: string, enabled = true) {
  return useQuery<BookWithTracking>({
    queryKey: queryKeys.book(id),
    queryFn: () => api.get<BookWithTracking>(`/books/${id}`),
    enabled: enabled && !!id
  });
}

export function useBookContent(id: string, enabled = true) {
  return useQuery<BookContent>({
    queryKey: queryKeys.bookContent(id),
    queryFn: () => api.get<BookContent>(`/books/${id}/content`),
    enabled
  });
}

export function useAdminBookContent(id: string) {
  return useQuery<AdminBookContentDTO>({
    queryKey: queryKeys.adminBookContent(id),
    queryFn: () => api.get<AdminBookContentDTO>(`/books/${id}/admin-content`),
    enabled: !!id
  });
}

export function useCategories() {
  return useQuery<CategoryDTO[]>({
    queryKey: queryKeys.categories,
    queryFn: () => api.get<CategoryDTO[]>('/categories')
  });
}

export function useLibrary() {
  return useQuery({
    queryKey: queryKeys.library,
    queryFn: () => api.get<LibraryResponse>('/me/library')
  });
}

export function useUpdateReadingProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, currentPage, completed = false }: { bookId: string; currentPage: number; completed?: boolean }) =>
      api.post<{ bookId: string; currentPage: number; readCount: number; lastReadAt: string }>(
        `/books/${bookId}/progress`,
        { currentPage, completed }
      ),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: queryKeys.book(variables.bookId) });
      qc.invalidateQueries({ queryKey: queryKeys.library });
    }
  });
}

export function useAdminCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => api.post<BookDTO>('/books', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] })
  });
}

export function useAdminUpdateBook(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => api.patch<BookDTO>(`/books/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['books'] }); qc.invalidateQueries({ queryKey: queryKeys.book(id) }); }
  });
}

export function useAdminUpdateBookContent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => api.put<AdminBookContentDTO>(`/books/${id}/admin-content`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminBookContent(id) });
      qc.invalidateQueries({ queryKey: queryKeys.book(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookContent(id) });
      qc.invalidateQueries({ queryKey: ['books'] });
    }
  });
}

export function useAdminArchiveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/books/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] })
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: { simulate?: 'fail' }) => api.post('/payments/subscribe', body ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book'] });
      qc.invalidateQueries({ queryKey: queryKeys.library });
    }
  });
}

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { bookId: string; simulate?: 'fail' }) => api.post('/payments/purchase', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book'] });
      qc.invalidateQueries({ queryKey: queryKeys.library });
    }
  });
}

export function useResetDemoState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{
      readingProgress: number;
      purchases: number;
      subscriptions: number;
      payments: number;
    }>('/auth/demo/reset', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book'] });
      qc.invalidateQueries({ queryKey: queryKeys.library });
    }
  });
}
