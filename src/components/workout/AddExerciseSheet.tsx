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
        <Button className="w-full h-11 text-sm font-semibold rounded-lg btn-gradient">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Exercise
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl border-t-0 bg-card px-4 pb-6">
        <div className="mx-auto w-10 h-1 rounded-full bg-border mb-4" />
        
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-lg font-bold flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            New Exercise
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="exercise-name" className="text-xs font-medium text-muted-foreground">
              Exercise Name
            </Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bench Press, Squat..."
              className="h-10 text-sm bg-secondary/50 border-border/50 rounded-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Muscle Group <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <div className="grid grid-cols-5 gap-1.5">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setMuscleGroup(muscleGroup === group.name ? "" : group.name)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 rounded-lg text-center transition-all duration-150",
                    muscleGroup === group.name
                      ? "bg-primary/15 ring-1.5 ring-primary text-foreground"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="text-base">{group.emoji}</span>
                  <span className="font-medium text-[10px] leading-tight">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full h-11 text-sm font-bold rounded-lg btn-gradient mt-2"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Save Exercise
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
