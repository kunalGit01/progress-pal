import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutDays, useExercises, useWorkoutSessions, useExerciseLogs } from "@/hooks/useWorkoutData";
import { AppLayout } from "@/components/layout/AppLayout";
import { DaySelector } from "@/components/workout/DaySelector";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { AddExerciseSheet } from "@/components/workout/AddExerciseSheet";
import { WeekSelector } from "@/components/workout/WeekSelector";
import { Loader2, Zap, Dumbbell } from "lucide-react";
import { format, startOfWeek, isSameWeek, getDay, isBefore, startOfDay } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const { workoutDays, loading: daysLoading, renameWorkoutDay } = useWorkoutDays();
  const [selectedDay, setSelectedDay] = useState<typeof workoutDays[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { exercises, loading: exercisesLoading, addExercise, deleteExercise } = useExercises(selectedDay?.id || null);
  const { sessions, createSession, getSessionByDate } = useWorkoutSessions();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { logs, addSet, updateSet, deleteSet, refetch: refetchLogs } = useExerciseLogs(currentSessionId);

  const isCurrentWeek = isSameWeek(selectedDate, new Date(), { weekStartsOn: 1 });
  
  // Calculate the actual date for the selected workout day
  const getWorkoutDate = (day: typeof workoutDays[0]) => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const workoutDate = new Date(weekStart);
    workoutDate.setDate(weekStart.getDate() + (day.day_number - 1));
    return workoutDate;
  };

  // Check if selected day is in the past (before today)
  const isSelectedDayPast = selectedDay 
    ? isBefore(startOfDay(getWorkoutDate(selectedDay)), startOfDay(new Date()))
    : false;

  // Auto-select the current day of the week when viewing current week
  useEffect(() => {
    if (workoutDays.length > 0) {
      if (isCurrentWeek) {
        // Get today's day number (1 = Monday, 7 = Sunday)
        const jsDay = getDay(new Date()); // 0 = Sunday, 1 = Monday, etc.
        const todayDayNumber = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 (Mon-Sun)
        
        // Find the workout day that matches today, or fall back to first day
        const todayWorkoutDay = workoutDays.find(d => d.day_number === todayDayNumber);
        const targetDay = todayWorkoutDay || workoutDays[0];
        
        if (!selectedDay || selectedDay.id !== targetDay.id) {
          setSelectedDay(targetDay);
        }
      } else if (!selectedDay) {
        // For other weeks, default to first day if nothing selected
        setSelectedDay(workoutDays[0]);
      }
    }
  }, [workoutDays, isCurrentWeek]);

  useEffect(() => {
    const initSession = async () => {
      if (!selectedDay) {
        setCurrentSessionId(null);
        return;
      }

      // Clear current session immediately to prevent showing stale data
      setCurrentSessionId(null);

      // Calculate the date for this workout day in the selected week
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const workoutDate = new Date(weekStart);
      workoutDate.setDate(weekStart.getDate() + (selectedDay.day_number - 1));

      const existingSession = await getSessionByDate(selectedDay.id, workoutDate);
      if (existingSession) {
        setCurrentSessionId(existingSession.id);
      } else if (isCurrentWeek) {
        // Only auto-create sessions for current week
        const newSession = await createSession(selectedDay.id, workoutDate);
        if (newSession) {
          setCurrentSessionId(newSession.id);
        }
      }
      // If no session and not current week, currentSessionId stays null
    };

    initSession();
  }, [selectedDay?.id, selectedDate, isCurrentWeek]);

  const handleAddExercise = async (name: string, muscleGroup?: string) => {
    await addExercise(name, muscleGroup);
  };

  const handleAddSet = async (exerciseId: string, exerciseName: string, muscleGroup: string | null, data: { reps: number; weight: number }) => {
    const exerciseLogs = logs.filter((l) => l.exercise_id === exerciseId);
    const setNumber = exerciseLogs.length + 1;

    await addSet({
      exerciseId,
      exerciseName,
      muscleGroup: muscleGroup || undefined,
      setNumber,
      reps: data.reps,
      weight: data.weight,
    });
  };

  if (daysLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Zap className="h-8 w-8 text-primary relative" />
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (workoutDays.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-3">
            <Dumbbell className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-0.5">No workout days set up</p>
          <p className="text-xs text-muted-foreground">Please complete onboarding first.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={true}>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Sticky header section */}
        <div className="flex-shrink-0 space-y-3 pb-3">
          {/* Header with Week Selector */}
          <div className="space-y-2 fade-up">
            <h1 className="text-lg font-bold text-foreground">
              {isCurrentWeek ? "Today's" : format(selectedDate, "MMM d")} <span className="text-gradient">Workout</span>
            </h1>
            <WeekSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>

          {/* Day selector */}
          <DaySelector
            days={workoutDays}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
            onRename={renameWorkoutDay}
          />
        </div>

        {/* Scrollable exercises section */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4 pb-4">
          {exercisesLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : !currentSessionId && isSelectedDayPast ? (
            // Past day with no session - show empty state
            <div className="text-center py-8 fade-up">
              <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground mb-0.5">No workout recorded</p>
              <p className="text-[10px] text-muted-foreground">No training data for this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.map((exercise, index) => {
                const exerciseLogs = logs.filter((l) => l.exercise_id === exercise.id);
                return (
                  <div 
                    key={exercise.id} 
                    className="fade-up" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      sets={exerciseLogs}
                      onAddSet={(data) => handleAddSet(exercise.id, exercise.name, exercise.muscle_group, data)}
                      onUpdateSet={updateSet}
                      onDeleteSet={deleteSet}
                      onDeleteExercise={() => deleteExercise(exercise.id)}
                    />
                  </div>
                );
              })}

              {exercises.length === 0 && !isSelectedDayPast && (
                <div className="text-center py-8 fade-up">
                  <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto mb-2">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground mb-0.5">No exercises yet</p>
                  <p className="text-[10px] text-muted-foreground mb-3">Add your first exercise to start</p>
                </div>
              )}

              {/* Only show add exercise button for today or future days */}
              {!isSelectedDayPast && <div className="fade-up">
                <AddExerciseSheet onAdd={handleAddExercise} />
              </div>}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
