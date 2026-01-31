'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
  className?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export function Header({ children, className, leftContent, rightContent }: HeaderProps) {
  return (
    <header className={cn('px-4 py-4 flex items-center justify-between bg-[#0F1328]', className)}>
      {leftContent && <div className="flex-shrink-0">{leftContent}</div>}
      {children && <div className="flex-1 px-4">{children}</div>}
      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </header>
  );
}
