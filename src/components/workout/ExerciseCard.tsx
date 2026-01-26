import { useState } from "react";
import { Exercise, ExerciseLog } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Check, X, Trophy, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      "exercise-card p-4 space-y-4 transition-all duration-300",
      isPR && "ring-2 ring-pr/50 shadow-lg shadow-pr/10"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-foreground truncate">{exercise.name}</h3>
            {isPR && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold pr-badge text-black">
                <Trophy className="h-3 w-3" />
                NEW PR
              </span>
            )}
          </div>
          {exercise.muscle_group && (
            <span className="text-xs text-muted-foreground font-medium">
              {exercise.muscle_group}
            </span>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onDeleteExercise}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sets list */}
      <div className="space-y-2">
        {sets.map((set, idx) => (
          <div
            key={set.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
              editingSet === set.id 
                ? "bg-primary/10 ring-1 ring-primary/30" 
                : "bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
              {idx + 1}
            </div>

            {editingSet === set.id ? (
              <>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                    className="h-10 w-16 text-center bg-background border-border/50 rounded-lg"
                    placeholder="Reps"
                  />
                  <span className="text-muted-foreground font-medium">×</span>
                  <Input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="h-10 w-20 text-center bg-background border-border/50 rounded-lg"
                    placeholder="kg"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-success hover:bg-success/90"
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
                  className="flex-1 flex items-center gap-2 text-left tap-target group"
                >
                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {set.reps}
                  </span>
                  <span className="text-muted-foreground">×</span>
                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {set.weight}
                  </span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 ring-1 ring-primary/20">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-sm font-bold text-primary">
              {sets.length + 1}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={newReps}
                onChange={(e) => setNewReps(e.target.value)}
                className="h-10 w-16 text-center bg-background border-primary/30 rounded-lg focus:ring-primary/30"
                placeholder="Reps"
                autoFocus
              />
              <span className="text-muted-foreground font-medium">×</span>
              <Input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="h-10 w-20 text-center bg-background border-primary/30 rounded-lg focus:ring-primary/30"
                placeholder="kg"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                className="h-9 w-9 bg-primary hover:bg-primary/90"
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
            className="w-full h-12 rounded-xl border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Set
          </Button>
        )}
      </div>
    </div>
  );
}
