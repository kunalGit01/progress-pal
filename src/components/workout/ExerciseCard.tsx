import { useState } from "react";
import { Exercise, ExerciseLog } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Check, X, Trophy, MoreVertical, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ExerciseCardProps {
  exercise: Exercise;
  sets: ExerciseLog[];
  onAddSet: (data: { reps: number; weight: number }) => void;
  onUpdateSet: (id: string, updates: { reps?: number; weight?: number }) => void;
  onDeleteSet: (id: string) => void;
  onDeleteExercise: () => void;
  personalBest?: { reps: number; weight: number };
  defaultOpen?: boolean;
}

export function ExerciseCard({
  exercise,
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onDeleteExercise,
  personalBest,
  defaultOpen = true,
}: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
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

  // Calculate summary for collapsed state
  const totalVolume = sets.reduce((sum, s) => sum + s.reps * s.weight, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "bg-card/60 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden transition-all duration-300",
        isPR && "ring-1 ring-pr/50",
        isOpen ? "shadow-lg" : "shadow-sm"
      )}>
        {/* Header - Always visible */}
        <div className="flex items-center gap-2 p-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 min-w-0 flex-1 text-left">
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                  isOpen && "rotate-180"
                )} 
              />
              <h3 className="font-semibold text-sm text-foreground truncate">{exercise.name}</h3>
              {exercise.muscle_group && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground shrink-0">
                  {exercise.muscle_group}
                </span>
              )}
              {isPR && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pr text-black shrink-0">
                  <Trophy className="h-2.5 w-2.5" />
                  PR
                </span>
              )}
            </button>
          </CollapsibleTrigger>
          
          {/* Summary when collapsed */}
          {!isOpen && sets.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span className="font-medium">{sets.length} sets</span>
              <span className="text-[10px]">•</span>
              <span className="font-medium">{totalVolume.toLocaleString()} kg</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDeleteExercise}
                className="text-destructive focus:text-destructive text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapsible content */}
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-3 pb-3 space-y-1.5">
            {/* Sets list */}
            {sets.map((set, idx) => (
              <div
                key={set.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md transition-all",
                  editingSet === set.id 
                    ? "bg-primary/10 ring-1 ring-primary/30" 
                    : "bg-secondary/30"
                )}
              >
                <div className="flex items-center justify-center h-6 w-6 rounded bg-secondary text-xs font-semibold text-muted-foreground">
                  {idx + 1}
                </div>

                {editingSet === set.id ? (
                  <>
                    <div className="flex-1 flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={editReps}
                        onChange={(e) => setEditReps(e.target.value)}
                        className="h-7 w-12 text-center text-xs bg-background border-border/50 rounded px-1"
                      />
                      <span className="text-muted-foreground text-xs">×</span>
                      <Input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="h-7 w-14 text-center text-xs bg-background border-border/50 rounded px-1"
                      />
                      <span className="text-[10px] text-muted-foreground">kg</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        className="h-7 w-7 bg-success hover:bg-success/90"
                        onClick={() => handleSaveEdit(set.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setEditingSet(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(set)}
                      className="flex-1 flex items-center gap-1.5 text-left group"
                    >
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {set.reps}
                      </span>
                      <span className="text-muted-foreground text-xs">×</span>
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {set.weight}
                      </span>
                      <span className="text-[10px] text-muted-foreground">kg</span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteSet(set.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {/* Add set form */}
            {isAdding ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 ring-1 ring-primary/20">
                <div className="flex items-center justify-center h-6 w-6 rounded bg-primary/20 text-xs font-semibold text-primary">
                  {sets.length + 1}
                </div>
                <div className="flex-1 flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="h-7 w-12 text-center text-xs bg-background border-primary/30 rounded px-1"
                    placeholder="Reps"
                    autoFocus
                  />
                  <span className="text-muted-foreground text-xs">×</span>
                  <Input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="h-7 w-14 text-center text-xs bg-background border-primary/30 rounded px-1"
                    placeholder="kg"
                  />
                  <span className="text-[10px] text-muted-foreground">kg</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-primary hover:bg-primary/90"
                    onClick={handleAddSet}
                    disabled={!newReps || !newWeight}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setIsAdding(false);
                      setNewReps("");
                      setNewWeight("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-8 rounded-md border border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Set
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
