import { WorkoutDay } from "@/hooks/useWorkoutData";
import { cn } from "@/lib/utils";

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDay: WorkoutDay | null;
  onSelect: (day: WorkoutDay) => void;
}

export function DaySelector({ days, selectedDay, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {days.map((day, index) => (
        <button
          key={day.id}
          onClick={() => onSelect(day)}
          className={cn(
            "relative flex-shrink-0 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 tap-target",
            "fade-up",
            selectedDay?.id === day.id
              ? "bg-gradient-to-r from-primary to-emerald-400 text-white shadow-lg glow-primary"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {day.name}
        </button>
      ))}
    </div>
  );
}
