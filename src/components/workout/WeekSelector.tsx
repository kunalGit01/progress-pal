import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";

interface WeekSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekSelector({ selectedDate, onDateChange }: WeekSelectorProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(selectedDate, new Date(), { weekStartsOn: 1 });

  const goToPreviousWeek = () => {
    onDateChange(subWeeks(selectedDate, 1));
  };

  const goToNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1));
  };

  const goToCurrentWeek = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={goToPreviousWeek}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <button
        onClick={goToCurrentWeek}
        className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
      >
        <Calendar className="h-3 w-3" />
        <span>
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </span>
        {isCurrentWeek && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded">
            This Week
          </span>
        )}
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={goToNextWeek}
        disabled={isCurrentWeek}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
