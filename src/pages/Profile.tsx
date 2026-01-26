import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useWorkoutDays } from "@/hooks/useWorkoutData";
import { LogOut, Zap, Calendar, Mail, User, Settings, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { workoutDays } = useWorkoutDays();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">
        {/* User card */}
        <div className="glass-card rounded-2xl p-6 fade-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg glow-primary">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center ring-2 ring-background">
                <Zap className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">
                {profile?.display_name || "Athlete"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Training setup */}
        <div className="glass-card rounded-2xl overflow-hidden fade-up stagger-1">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Training Setup
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Training Days</span>
              <span className="font-bold text-foreground">
                {profile?.training_days_per_week || 0} <span className="text-muted-foreground font-normal">per week</span>
              </span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Your Workout Days</span>
              <div className="flex flex-wrap gap-2">
                {workoutDays.map((day) => (
                  <span
                    key={day.id}
                    className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm font-medium text-foreground"
                  >
                    {day.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="glass-card rounded-2xl overflow-hidden fade-up stagger-2">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Account
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium text-foreground">
                {user?.created_at
                  ? format(new Date(user.created_at), "MMM d, yyyy")
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="fade-up stagger-3 pt-4">
          <Button
            variant="outline"
            className="w-full h-14 rounded-xl border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
