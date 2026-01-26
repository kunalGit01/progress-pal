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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/30" />
          <div className="relative max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {headerAction}
          </div>
        </header>
      )}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-28">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
