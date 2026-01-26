import { WorkoutDay } from "@/hooks/useWorkoutData";
import { cn } from "@/lib/utils";

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDay: WorkoutDay | null;
  onSelect: (day: WorkoutDay) => void;
}

export function DaySelector({ days, selectedDay, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {days.map((day, index) => (
        <button
          key={day.id}
          onClick={() => onSelect(day)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-md font-medium text-xs transition-all",
            selectedDay?.id === day.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          {day.name}
        </button>
      ))}
    </div>
  );
}
