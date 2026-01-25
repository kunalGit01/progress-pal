import { WorkoutDay } from "@/hooks/useWorkoutData";
import { cn } from "@/lib/utils";

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDay: WorkoutDay | null;
  onSelect: (day: WorkoutDay) => void;
}

export function DaySelector({ days, selectedDay, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
      {days.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelect(day)}
          className={cn(
            "flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm transition-all tap-target",
            selectedDay?.id === day.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          {day.name}
        </button>
      ))}
    </div>
  );
}
