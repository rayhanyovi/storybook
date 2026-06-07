import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { ChunkyButton } from '@/components/ChunkyButton';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 p-6 text-center">
          <Mascot pose="error" size="lg" speech="Something went wrong" />
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-semibold text-3xl text-[var(--ink)]">
              Oops
            </h1>
            <p className="font-[family-name:var(--font-body)] text-[var(--ink-soft)] mt-1">
              Something unexpected happened.
            </p>
          </div>
          <ChunkyButton onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}>
            <ChevronLeft className="h-4 w-4" />
            Back home
          </ChunkyButton>
        </div>
      );
    }
    return this.props.children;
  }
}
