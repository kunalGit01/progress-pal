import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export function AppLayout({ children, title, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {title && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
