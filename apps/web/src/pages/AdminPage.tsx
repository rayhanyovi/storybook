import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Archive, BookOpen, CircleDollarSign, FileText, Layers3, LogOut, Pencil, Plus, Search, ShieldCheck } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ChunkyButton } from '@/components/ChunkyButton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBooks, useCategories, useAdminCreateBook, useAdminArchiveBook, useAdminUpdateBook } from '@/hooks/useBooks';
import { useAuth } from '@/providers/AuthProvider';
import type { BookDTO, BookStatus } from '@storybook/shared';

type BookFormState = {
  slug: string;
  title: string;
  author: string;
  description: string;
  priceCents: number;
  ageMin: number;
  ageMax: number;
  pageCount: number;
  status: BookStatus;
  categoryIds: string[];
};

const statusConfig: Record<BookStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Published', className: 'bg-[var(--color-success)]/15 text-[var(--color-success)]' },
  DRAFT: { label: 'Draft', className: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]' },
  ARCHIVED: { label: 'Archived', className: 'bg-[var(--muted)] text-[var(--ink-soft)]' },
};

const emptyForm: BookFormState = {
  slug: '',
  title: '',
  author: 'Storybook',
  description: '',
  priceCents: 0,
  ageMin: 0,
  ageMax: 12,
  pageCount: 6,
  status: 'DRAFT',
  categoryIds: []
};

function formFromBook(book?: BookDTO): BookFormState {
  if (!book) return emptyForm;
  return {
    slug: book.slug,
    title: book.title,
    author: book.author,
    description: book.description,
    priceCents: book.priceCents,
    ageMin: book.ageMin,
    ageMax: book.ageMax,
    pageCount: book.pageCount,
    status: book.status,
    categoryIds: book.categories.map(category => category.id)
  };
}

function StatusPill({ status }: { status: BookStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold', config.className)}>
      {config.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof BookOpen }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_10px_24px_rgba(58,46,40,0.07)]">
      <Icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={2.4} />
      <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">{value}</p>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{label}</p>
    </div>
  );
}

function BookFormDialog({ book, className }: { book?: BookDTO; className?: string }) {
  const { data: categories } = useCategories();
  const createBook = useAdminCreateBook();
  const updateBook = useAdminUpdateBook(book?.id ?? '');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookFormState>(() => formFromBook(book));
  const editing = Boolean(book);
  const pending = createBook.isPending || updateBook.isPending;

  useEffect(() => {
    if (open) setForm(formFromBook(book));
  }, [book, open]);

  function setField<K extends keyof BookFormState>(key: K, value: BookFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        const { slug: _slug, ...body } = form;
        await updateBook.mutateAsync(body);
        toast.success('Book updated.');
      } else {
        await createBook.mutateAsync(form);
        toast.success('Book created.');
      }
      setOpen(false);
      if (!editing) setForm(emptyForm);
    } catch {
      toast.error(editing ? 'Failed to update book.' : 'Failed to create book.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <button className={cn('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 text-xs font-extrabold text-[var(--ink)] transition hover:bg-[var(--line)]', className)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <ChunkyButton variant="secondary" size="sm">
            <Plus className="h-4 w-4" />
            New book
          </ChunkyButton>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-[var(--background)]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {editing ? 'Edit book' : 'Create book'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="slug" className="text-sm font-bold text-[var(--ink)]">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                disabled={editing}
                required
                placeholder="my-book-slug"
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('slug', event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="author" className="text-sm font-bold text-[var(--ink)]">Author</Label>
              <Input
                id="author"
                value={form.author}
                required
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('author', event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-sm font-bold text-[var(--ink)]">Title</Label>
            <Input
              id="title"
              value={form.title}
              required
              className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
              onChange={event => setField('title', event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-sm font-bold text-[var(--ink)]">Description</Label>
            <Input
              id="description"
              value={form.description}
              placeholder="Short catalog description"
              className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
              onChange={event => setField('description', event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Price (IDR)</Label>
              <Input
                type="number"
                min={0}
                value={form.priceCents}
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('priceCents', Number(event.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Age min</Label>
              <Input
                type="number"
                min={0}
                value={form.ageMin}
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('ageMin', Number(event.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Age max</Label>
              <Input
                type="number"
                min={0}
                value={form.ageMax}
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('ageMax', Number(event.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Pages</Label>
              <Input
                type="number"
                min={1}
                value={form.pageCount}
                className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"
                onChange={event => setField('pageCount', Number(event.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Status</Label>
              <Select value={form.status} onValueChange={value => setField('status', value as BookStatus)}>
                <SelectTrigger className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-bold text-[var(--ink)]">Category</Label>
              <Select value={form.categoryIds[0] ?? ''} onValueChange={value => setField('categoryIds', [value])}>
                <SelectTrigger className="h-12 rounded-2xl border-[var(--line)] bg-[var(--card)]"><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ChunkyButton type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? 'Saving' : editing ? 'Save changes' : 'Create book'}
          </ChunkyButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: booksData, isLoading } = useBooks({ limit: 100 });
  const archiveBook = useAdminArchiveBook();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookStatus>('ALL');

  function handleLogout() {
    logout();
    navigate('/auth/login', { replace: true });
  }

  const books = booksData?.data ?? [];
  const visibleBooks = useMemo(() => {
    return books.filter(book => {
      const textMatch = `${book.title} ${book.author} ${book.slug}`.toLowerCase().includes(query.toLowerCase());
      const statusMatch = statusFilter === 'ALL' || book.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [books, query, statusFilter]);

  const published = books.filter(book => book.status === 'PUBLISHED').length;
  const draft = books.filter(book => book.status === 'DRAFT').length;
  const archived = books.filter(book => book.status === 'ARCHIVED').length;
  const paid = books.filter(book => book.priceCents > 0).length;

  async function handleArchive(id: string) {
    try {
      await archiveBook.mutateAsync(id);
      toast.success('Book archived.');
    } catch {
      toast.error('Failed to archive book.');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <header className="border-b border-[var(--line)] bg-[var(--card)] px-4 py-4 md:px-7">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <ChunkyButton variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </ChunkyButton>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-none text-[var(--ink)]">Admin catalog</h1>
            <p className="mt-1 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:block">Create, edit, publish, archive</p>
          </div>
          <BookFormDialog />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 md:px-7">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={books.length} icon={BookOpen} />
          <StatCard label="Published" value={published} icon={ShieldCheck} />
          <StatCard label="Draft" value={draft} icon={Layers3} />
          <StatCard label="Paid" value={paid} icon={CircleDollarSign} />
        </section>

        <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_14px_34px_rgba(58,46,40,0.08)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">Books</h2>
              <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">
                {visibleBooks.length} shown · {archived} archived
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search catalog"
                  className="h-11 rounded-2xl border-[var(--line)] bg-[var(--background)] pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={value => setStatusFilter(value as 'ALL' | BookStatus)}>
                <SelectTrigger className="h-11 min-w-40 rounded-2xl border-[var(--line)] bg-[var(--background)]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : (
            <>
              <div className="mt-5 hidden overflow-hidden rounded-2xl border border-[var(--line)] md:block">
                <table className="w-full border-collapse bg-[var(--background)]">
                  <thead className="bg-[var(--muted)] text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    <tr>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {(visibleBooks as BookDTO[]).map(book => (
                      <tr key={book.id} className="bg-[var(--card)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <PlaceholderImage
                              slot={book.coverSlot ?? `book.cover.${book.slug}`}
                              label={`cover - ${book.title}`}
                              ratio="4/3"
                              className="h-16 w-[5.35rem] shrink-0 rounded-xl border-0"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">{book.title}</p>
                              <p className="mt-0.5 text-xs font-bold text-[var(--ink-soft)]">{book.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-[var(--ink-soft)]">
                          {book.categories.map(category => category.name).join(', ') || 'None'}
                        </td>
                        <td className="px-4 py-3 text-sm font-extrabold text-[var(--ink)]">
                          {book.priceCents === 0 ? 'Free' : `Rp ${book.priceCents.toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-4 py-3"><StatusPill status={book.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/admin/books/${book.id}/content`)}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 text-xs font-extrabold text-[var(--ink)] transition hover:bg-[var(--line)]"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Pages
                            </button>
                            <BookFormDialog book={book} />
                            {book.status !== 'ARCHIVED' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 text-xs font-extrabold text-[var(--color-destructive)] transition hover:bg-red-50">
                                    <Archive className="h-3.5 w-3.5" />
                                    Archive
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[var(--background)]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-[family-name:var(--font-display)] text-[var(--ink)]">Archive "{book.title}"?</AlertDialogTitle>
                                    <AlertDialogDescription className="font-[family-name:var(--font-body)] font-semibold text-[var(--ink-soft)]">
                                      The book will leave the public catalog. Existing owners can still read it.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-[family-name:var(--font-body)]">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleArchive(book.id)}
                                      className="rounded-xl bg-[var(--color-destructive)] font-[family-name:var(--font-body)] text-white hover:bg-red-600"
                                    >
                                      Archive
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid gap-3 md:hidden">
                {(visibleBooks as BookDTO[]).map(book => (
                  <div key={book.id} className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--background)]">
                    <div className="flex gap-3 p-3">
                      <PlaceholderImage
                        slot={book.coverSlot ?? `book.cover.${book.slug}`}
                        label={`cover - ${book.title}`}
                        ratio="4/3"
                        className="h-24 w-32 shrink-0 rounded-xl border-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 font-[family-name:var(--font-display)] font-semibold leading-tight text-[var(--ink)]">{book.title}</p>
                          <StatusPill status={book.status} />
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--ink-soft)]">{book.slug}</p>
                        <p className="mt-2 text-sm font-extrabold text-[var(--ink)]">{book.priceCents === 0 ? 'Free' : `Rp ${book.priceCents.toLocaleString('id-ID')}`}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--line)] p-3 sm:grid-cols-3">
                      <button
                        onClick={() => navigate(`/admin/books/${book.id}/content`)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 text-xs font-extrabold text-[var(--ink)]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Pages
                      </button>
                      <BookFormDialog book={book} className="w-full" />
                      {book.status !== 'ARCHIVED' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] px-3 text-xs font-extrabold text-[var(--color-destructive)]">
                              <Archive className="h-3.5 w-3.5" />
                              Archive
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[var(--background)]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-[family-name:var(--font-display)] text-[var(--ink)]">Archive "{book.title}"?</AlertDialogTitle>
                              <AlertDialogDescription className="font-[family-name:var(--font-body)] font-semibold text-[var(--ink-soft)]">
                                The book will leave the public catalog. Existing owners can still read it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl font-[family-name:var(--font-body)]">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleArchive(book.id)}
                                className="rounded-xl bg-[var(--color-destructive)] font-[family-name:var(--font-body)] text-white hover:bg-red-600"
                              >
                                Archive
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
