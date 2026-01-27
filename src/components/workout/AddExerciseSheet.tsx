import { useState, useMemo } from "react";
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
import { Plus, Dumbbell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchExercises, ExerciseItem } from "@/data/exerciseDatabase";

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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    return searchExercises(name, 6);
  }, [name]);

  const handleSelectSuggestion = (exercise: ExerciseItem) => {
    setName(exercise.name);
    setMuscleGroup(exercise.muscleGroup);
    setShowSuggestions(false);
  };

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
        <Button className="w-full h-9 text-xs font-semibold rounded-lg btn-gradient">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Exercise
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[75vh] rounded-t-xl border-t-0 bg-card px-3 pb-4">
        <div className="mx-auto w-8 h-1 rounded-full bg-border mb-3" />
        
        <SheetHeader className="text-left pb-3">
          <SheetTitle className="text-sm font-bold flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-primary" />
            New Exercise
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          <div className="space-y-1 relative">
            <Label htmlFor="exercise-name" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Exercise Name
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="exercise-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type to search..."
                className="h-9 text-sm bg-secondary/50 border-border/50 rounded-lg pl-8"
                autoFocus
              />
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 py-1 bg-card border border-border/50 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((exercise, index) => (
                  <button
                    key={`${exercise.name}-${index}`}
                    onClick={() => handleSelectSuggestion(exercise)}
                    className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-foreground">{exercise.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {exercise.muscleGroup}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Muscle Group <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <div className="grid grid-cols-5 gap-1">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setMuscleGroup(muscleGroup === group.name ? "" : group.name)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-1.5 rounded-md text-center transition-all duration-150",
                    muscleGroup === group.name
                      ? "bg-primary/15 ring-1 ring-primary text-foreground"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="text-sm">{group.emoji}</span>
                  <span className="font-medium text-[9px] leading-tight">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full h-9 text-xs font-bold rounded-lg btn-gradient"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Save Exercise
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
