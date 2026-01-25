import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Cardio",
  "Full Body",
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
        <Button className="w-full h-14 text-base font-semibold">
          <Plus className="h-5 w-5 mr-2" />
          Add Exercise
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl">Add Exercise</SheetTitle>
          <SheetDescription>
            Add a new exercise to this workout day
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bench Press"
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="muscle-group">Muscle Group (optional)</Label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full h-12 text-base font-semibold"
          >
            Add Exercise
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
