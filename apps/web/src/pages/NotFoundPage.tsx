import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Mascot pose="404" size="lg" speech="Page not found" />
      <div>
        <h1 className="font-[family-name:var(--font-display)] font-semibold text-4xl text-[var(--ink)]">404</h1>
        <p className="font-[family-name:var(--font-body)] text-[var(--ink-soft)] mt-1">
          We couldn't find what you were looking for.
        </p>
      </div>
      <ChunkyButton onClick={() => navigate('/')}>
        <ChevronLeft className="h-4 w-4" />
        Back home
      </ChunkyButton>
    </div>
  );
}
