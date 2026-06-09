import { User } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { ProfileContent } from '@/components/ProfileSheet';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-10">
      <AppHeader title="Profile" subtitle="Account and reading activity" icon={User} active="profile" />
      <main className="mx-auto flex max-w-2xl px-4 pt-6 md:px-7">
        <div className="min-h-[calc(100vh-10rem)] w-full overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--background)] shadow-[0_14px_34px_rgba(58,46,40,0.08)]">
          <ProfileContent />
        </div>
      </main>
    </div>
  );
}
