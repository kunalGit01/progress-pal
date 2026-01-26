import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = [
  { name: "Chest", emoji: "🏋️" },
  { name: "Back", emoji: "💪" },
  { name: "Shoulders", emoji: "🎯" },
  { name: "Biceps", emoji: "💪" },
  { name: "Triceps", emoji: "🔥" },
  { name: "Legs", emoji: "🦵" },
  { name: "Glutes", emoji: "🍑" },
  { name: "Core", emoji: "🧘" },
  { name: "Cardio", emoji: "🏃" },
  { name: "Full Body", emoji: "⚡" },
];

interface AddExerciseSheetProps {
  onAdd: (name: string, muscleGroup?: string) => Promise<void>;
}

export function AddExerciseSheet({ onAdd }: AddExerciseSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    await onAdd(name.trim(), muscleGroup || undefined);
    setIsSubmitting(false);
    setName("");
    setMuscleGroup("");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full h-14 text-base font-bold rounded-xl btn-gradient">
          <Plus className="h-5 w-5 mr-2" />
          Add Exercise
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl border-t-0 bg-card">
        <div className="mx-auto w-12 h-1.5 rounded-full bg-border mb-6" />
        
        <SheetHeader className="text-left pb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            New Exercise
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Exercise name */}
          <div className="space-y-2">
            <Label htmlFor="exercise-name" className="text-sm font-medium text-muted-foreground">
              Exercise Name
            </Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bench Press, Squat, Deadlift..."
              className="h-14 text-base bg-secondary/50 border-border/50 rounded-xl"
              autoFocus
            />
          </div>

          {/* Muscle group selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Muscle Group <span className="text-muted-foreground/50">(optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setMuscleGroup(muscleGroup === group.name ? "" : group.name)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-200",
                    muscleGroup === group.name
                      ? "bg-primary/10 ring-2 ring-primary text-foreground"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <span className="text-lg">{group.emoji}</span>
                  <span className="font-medium text-sm">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full h-14 text-base font-bold rounded-xl btn-gradient"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Exercise
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
