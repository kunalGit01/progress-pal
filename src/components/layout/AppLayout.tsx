import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  headerAction?: ReactNode;
}

export function AppLayout({ children, title, showNav = true, headerAction }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {title && (
        <header className="sticky top-0 z-40 safe-top">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-b border-border/30" />
          <div className="relative max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-base font-bold text-foreground">{title}</h1>
            {headerAction}
          </div>
        </header>
      )}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 pb-20">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
