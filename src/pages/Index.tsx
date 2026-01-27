import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutDays, useExercises, useWorkoutSessions, useExerciseLogs } from "@/hooks/useWorkoutData";
import { AppLayout } from "@/components/layout/AppLayout";
import { DaySelector } from "@/components/workout/DaySelector";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { AddExerciseSheet } from "@/components/workout/AddExerciseSheet";
import { WeekSelector } from "@/components/workout/WeekSelector";
import { Loader2, Zap, Dumbbell } from "lucide-react";
import { format, startOfWeek, isSameWeek } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const { workoutDays, loading: daysLoading, renameWorkoutDay } = useWorkoutDays();
  const [selectedDay, setSelectedDay] = useState(workoutDays[0] || null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { exercises, loading: exercisesLoading, addExercise, deleteExercise } = useExercises(selectedDay?.id || null);
  const { sessions, createSession, getSessionByDate } = useWorkoutSessions();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { logs, addSet, updateSet, deleteSet, refetch: refetchLogs } = useExerciseLogs(currentSessionId);

  const isCurrentWeek = isSameWeek(selectedDate, new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (workoutDays.length > 0 && !selectedDay) {
      setSelectedDay(workoutDays[0]);
    }
  }, [workoutDays, selectedDay]);

  useEffect(() => {
    const initSession = async () => {
      if (!selectedDay) return;

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
      } else {
        setCurrentSessionId(null);
      }
    };

    initSession();
  }, [selectedDay?.id, selectedDate]);

  useEffect(() => {
    if (currentSessionId) {
      refetchLogs();
    }
  }, [currentSessionId]);

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
    <AppLayout>
      <div className="space-y-3">
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

        {/* Exercises */}
        {exercisesLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
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

            {exercises.length === 0 && (
              <div className="text-center py-8 fade-up">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto mb-2">
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground mb-0.5">No exercises yet</p>
                <p className="text-[10px] text-muted-foreground mb-3">Add your first exercise to start</p>
              </div>
            )}

            {!currentSessionId && !isCurrentWeek ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No session data for this week</p>
              </div>
            ) : (
              <div className="fade-up">
                <AddExerciseSheet onAdd={handleAddExercise} />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
