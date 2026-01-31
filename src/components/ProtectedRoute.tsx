'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isFullyAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isFullyAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isFullyAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D1F] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isFullyAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
