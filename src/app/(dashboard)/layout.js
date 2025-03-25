'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { MainNav } from '@/components/MainNav';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 h-full">
        <MainNav />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
} 