export type Role = 'ADMIN' | 'USER';

export type BookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AccessReason =
  | 'ADMIN'
  | 'FREE'
  | 'OWNED'
  | 'SUBSCRIPTION'
  | 'LOCKED';

export interface AccessResult {
  canAccess: boolean;
  reason: AccessReason;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface BookDTO {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  coverSlot: string | null;
  priceCents: number;
  currency: string;
  ageMin: number;
  ageMax: number;
  pageCount: number;
  status: BookStatus;
  categories: CategoryDTO[];
}

export interface BookWithAccess extends BookDTO {
  access: AccessResult;
}

export interface BookPage {
  index: number;
  imageSlot: string;
  label: string;
  text: string;
}

export interface BookContent {
  bookId: string;
  pages: BookPage[];
}

export interface AdminBookPageInput {
  index: number;
  imageSlot?: string | null;
  text: string;
}

export interface AdminBookContentDTO {
  bookId: string;
  coverSlot: string | null;
  pageCount: number;
  pages: BookPage[];
}

export interface UserDTO {
  id: string;
  email: string;
  role: Role;
  onboardingCompletedAt: string | null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
