import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Check, ChevronRight } from "lucide-react";
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
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Zap className="h-12 w-12 text-primary relative" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        </div>
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
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          training_days_per_week: selectedDays,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

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
        title: "You're all set! 💪",
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="relative flex-shrink-0 px-6 pt-16 pb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative text-center space-y-3 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            Quick Setup
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            How often do you train?
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Select the number of days per week you typically workout
          </p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto space-y-8 fade-up stagger-1">
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDays(day)}
                className={`
                  relative aspect-square rounded-2xl font-bold text-xl transition-all duration-200
                  flex items-center justify-center
                  ${selectedDays === day
                    ? "bg-gradient-to-br from-primary to-emerald-400 text-white shadow-lg glow-primary scale-105"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                {day}
                {selectedDays === day && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center shadow-md scale-in">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info card */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-black text-gradient">{selectedDays}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {selectedDays} day{selectedDays > 1 ? "s" : ""} per week
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll create {selectedDays} custom workout template{selectedDays > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: selectedDays }, (_, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm font-medium text-muted-foreground"
                >
                  {DAY_NAMES[i]}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleSubmit}
            className="w-full h-14 text-base font-bold rounded-xl btn-gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Start Training
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
