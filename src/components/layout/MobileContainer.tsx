import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn('max-w-[430px] mx-auto min-h-screen', className)}>
      {children}
    </div>
  );
}
