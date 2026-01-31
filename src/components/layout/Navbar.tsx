'use client';

import { Home, Zap, CreditCard } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  hidden?: boolean;
}

export function Navbar({ hidden = false }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1328] border-t border-blue-900/30 px-4 py-3 z-50">
      <div className="max-w-[430px] mx-auto flex items-center justify-around">
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/dashboard')
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-blue-400'
          } transition-colors`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => router.push('/ai-studio')}
          className="flex flex-col items-center gap-1 -mt-8"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/50 mb-1">
            <Zap className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <span className={`text-xs font-semibold ${
            isActive('/ai-studio')
              ? 'text-blue-400'
              : 'text-blue-400'
          }`}>
            AI Studio
          </span>
        </button>

        <button
          onClick={() => router.push('/wallet')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/wallet')
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-blue-400'
          } transition-colors`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-xs">Balance</span>
        </button>
      </div>
    </nav>
  );
}
