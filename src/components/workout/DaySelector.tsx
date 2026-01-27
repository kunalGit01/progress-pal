import { useState } from "react";
import { WorkoutDay } from "@/hooks/useWorkoutData";
import { cn } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDay: WorkoutDay | null;
  onSelect: (day: WorkoutDay) => void;
  onRename?: (dayId: string, newName: string) => Promise<void>;
}

export function DaySelector({ days, selectedDay, onSelect, onRename }: DaySelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (day: WorkoutDay, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(day.id);
    setEditValue(day.name);
  };

  const handleSave = async (dayId: string) => {
    if (editValue.trim() && onRename) {
      await onRename(dayId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, dayId: string) => {
    if (e.key === "Enter") {
      handleSave(dayId);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {days.map((day, index) => (
        <div
          key={day.id}
          className="flex-shrink-0"
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          {editingId === day.id ? (
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, day.id)}
                className="h-6 w-24 text-xs px-2 bg-background"
                autoFocus
              />
              <button
                onClick={() => handleSave(day.id)}
                className="p-1 hover:bg-primary/20 rounded text-primary"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-destructive/20 rounded text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelect(day)}
              className={cn(
                "group flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all",
                selectedDay?.id === day.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span>{day.name}</span>
              {onRename && (
                <Pencil
                  className={cn(
                    "h-2.5 w-2.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer",
                    selectedDay?.id === day.id ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                  onClick={(e) => handleStartEdit(day, e)}
                />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
