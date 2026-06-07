import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ModeProvider, useMode } from '@/providers/ModeProvider';
import { PinProvider } from '@/providers/PinProvider';
import { useMe } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import KidHomePage from '@/pages/KidHomePage';
import BookDetailPage from '@/pages/BookDetailPage';
import ReaderPage from '@/pages/ReaderPage';
import ParentPage from '@/pages/ParentPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AdminPage from '@/pages/AdminPage';
import AdminBookContentPage from '@/pages/AdminBookContentPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LibraryPage from '@/pages/LibraryPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PageTransition } from '@/components/PageTransition';
import { ParentGate } from '@/components/ParentGate';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-[var(--background)] grid place-items-center">
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--card)] px-5 py-4 text-[var(--ink-soft)] shadow-[0_12px_32px_rgba(58,46,40,0.08)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-[family-name:var(--font-body)] font-bold">Opening the library</span>
      </div>
    </div>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoadingShell />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireParentMode({ children }: { children: React.ReactNode }) {
  const { isParent } = useMode();
  const navigate = useNavigate();
  if (!isParent) {
    return (
      <ParentGate
        onSuccess={() => {}}
        onCancel={() => navigate('/', { replace: true })}
      />
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { token, user, logout } = useAuth();
  const me = useMe();
  const location = useLocation();

  useEffect(() => {
    if (token && me.isError) logout();
  }, [logout, me.isError, token]);

  if (token && me.isError) return <Navigate to="/login" replace />;
  if (token && !user && me.isLoading) return <LoadingShell />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition>{token ? <Navigate to="/" replace /> : <LoginPage />}</PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><RequireAuth><OnboardingPage /></RequireAuth></PageTransition>} />
        <Route path="/" element={
          <PageTransition>
            <RequireAuth>
              {user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <KidHomePage />}
            </RequireAuth>
          </PageTransition>
        } />
        <Route path="/library" element={<PageTransition><RequireAuth><LibraryPage /></RequireAuth></PageTransition>} />
        <Route path="/book/:id" element={<PageTransition><RequireAuth><BookDetailPage /></RequireAuth></PageTransition>} />
        <Route path="/read/:id" element={<PageTransition><RequireAuth><ReaderPage /></RequireAuth></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><RequireAuth><CheckoutPage /></RequireAuth></PageTransition>} />
        <Route path="/parent" element={<PageTransition><RequireAuth><RequireParentMode><ParentPage /></RequireParentMode></RequireAuth></PageTransition>} />
        <Route path="/admin" element={<PageTransition><RequireAuth><RequireAdmin><AdminPage /></RequireAdmin></RequireAuth></PageTransition>} />
        <Route path="/admin/books/:id/content" element={<PageTransition><RequireAuth><RequireAdmin><AdminBookContentPage /></RequireAdmin></RequireAuth></PageTransition>} />
        <Route path="/admin/book/:id" element={<PageTransition><RequireAuth><RequireAdmin><AdminPage /></RequireAdmin></RequireAuth></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModeProvider>
          <PinProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </BrowserRouter>
            <Toaster richColors position="top-right" />
          </PinProvider>
        </ModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
