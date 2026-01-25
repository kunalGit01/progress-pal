import { useState } from "react";
import { Exercise, ExerciseLog } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Check, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  sets: ExerciseLog[];
  onAddSet: (data: { reps: number; weight: number }) => void;
  onUpdateSet: (id: string, updates: { reps?: number; weight?: number }) => void;
  onDeleteSet: (id: string) => void;
  onDeleteExercise: () => void;
  personalBest?: { reps: number; weight: number };
}

export function ExerciseCard({
  exercise,
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onDeleteExercise,
  personalBest,
}: ExerciseCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newReps, setNewReps] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [editingSet, setEditingSet] = useState<string | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");

  const handleAddSet = () => {
    const reps = parseInt(newReps);
    const weight = parseFloat(newWeight);

    if (reps > 0 && weight >= 0) {
      onAddSet({ reps, weight });
      setNewReps("");
      setNewWeight("");
      setIsAdding(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    const reps = parseInt(editReps);
    const weight = parseFloat(editWeight);

    if (reps > 0 && weight >= 0) {
      onUpdateSet(id, { reps, weight });
      setEditingSet(null);
    }
  };

  const startEdit = (set: ExerciseLog) => {
    setEditingSet(set.id);
    setEditReps(set.reps.toString());
    setEditWeight(set.weight.toString());
  };

  const isPR = personalBest && sets.some(
    (s) => s.weight > personalBest.weight || (s.weight === personalBest.weight && s.reps > personalBest.reps)
  );

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border p-4 space-y-3",
      isPR && "border-pr/50 shadow-[0_0_20px_-5px] shadow-pr/20"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{exercise.name}</h3>
          {isPR && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pr/20 text-pr text-xs font-medium pr-badge">
              <Trophy className="h-3 w-3" />
              PR
            </div>
          )}
        </div>
        {exercise.muscle_group && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {exercise.muscle_group}
          </span>
        )}
      </div>

      {/* Sets list */}
      <div className="space-y-2">
        {sets.map((set, idx) => (
          <div
            key={set.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all",
              editingSet === set.id && "bg-accent"
            )}
          >
            <span className="text-sm font-medium text-muted-foreground w-8">
              #{idx + 1}
            </span>

            {editingSet === set.id ? (
              <>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                    className="h-10 w-20 text-center bg-background"
                    placeholder="Reps"
                  />
                  <span className="text-muted-foreground">×</span>
                  <Input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="h-10 w-24 text-center bg-background"
                    placeholder="Weight"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-success"
                    onClick={() => handleSaveEdit(set.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setEditingSet(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEdit(set)}
                  className="flex-1 flex items-center gap-2 text-left tap-target"
                >
                  <span className="text-lg font-bold text-foreground">{set.reps}</span>
                  <span className="text-muted-foreground">×</span>
                  <span className="text-lg font-bold text-foreground">{set.weight}</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteSet(set.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}

        {/* Add set form */}
        {isAdding ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground w-8">
              #{sets.length + 1}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={newReps}
                onChange={(e) => setNewReps(e.target.value)}
                className="h-10 w-20 text-center"
                placeholder="Reps"
                autoFocus
              />
              <span className="text-muted-foreground">×</span>
              <Input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="h-10 w-24 text-center"
                placeholder="Weight"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-success"
                onClick={handleAddSet}
                disabled={!newReps || !newWeight}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => {
                  setIsAdding(false);
                  setNewReps("");
                  setNewWeight("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-12 border border-dashed border-border hover:border-primary hover:bg-primary/5"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        )}
      </div>

      {/* Delete exercise button */}
      {sets.length === 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDeleteExercise}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Exercise
        </Button>
      )}
    </div>
  );
}
