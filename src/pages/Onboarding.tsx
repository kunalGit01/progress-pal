import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Dumbbell, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DAY_NAMES = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export default function Onboarding() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Update profile with training days
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          training_days_per_week: selectedDays,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Create workout day templates
      const workoutDays = Array.from({ length: selectedDays }, (_, i) => ({
        user_id: user.id,
        day_number: i + 1,
        name: DAY_NAMES[i],
      }));

      const { error: daysError } = await supabase
        .from("workout_days")
        .insert(workoutDays);

      if (daysError) throw daysError;

      await refreshProfile();

      toast({
        title: "Setup complete!",
        description: `Created ${selectedDays} workout days for you.`,
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Let's set up your training</h1>
        <p className="text-muted-foreground mt-1 text-center">
          How many days per week do you train?
        </p>
      </div>

      <Card className="w-full max-w-sm border-border/50 bg-card animate-fade-in">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDays(day)}
                className={`
                  relative h-14 rounded-lg font-bold text-lg transition-all tap-target
                  ${selectedDays === day
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                  }
                `}
              >
                {day}
                {selectedDays === day && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center success-animate">
                    <Check className="h-3 w-3 text-success-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              We'll create <span className="text-foreground font-semibold">{selectedDays}</span> workout day{selectedDays > 1 ? "s" : ""} for you.
              You can customize exercises for each day.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Get Started"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
