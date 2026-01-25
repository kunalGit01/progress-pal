import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkoutDays } from "@/hooks/useWorkoutData";
import { LogOut, Dumbbell, Calendar, Mail } from "lucide-react";
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
        {/* User info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {profile?.display_name || "Athlete"}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training setup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Training Days</span>
              <span className="font-semibold">{profile?.training_days_per_week || 0} per week</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Your Workout Days</span>
              <div className="flex flex-wrap gap-2">
                {workoutDays.map((day) => (
                  <div
                    key={day.id}
                    className="px-3 py-2 bg-muted rounded-lg text-sm font-medium"
                  >
                    {day.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-sm">
                {user?.created_at
                  ? format(new Date(user.created_at), "MMMM d, yyyy")
                  : "Unknown"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}
