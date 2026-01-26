import { NavLink } from "react-router-dom";
import { Dumbbell, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Dumbbell, label: "Workout" },
  { to: "/dashboard", icon: BarChart3, label: "Progress" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/40 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto py-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-1 px-4 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
