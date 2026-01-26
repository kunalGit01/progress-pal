import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutDays, useExercises, useWorkoutSessions, useExerciseLogs } from "@/hooks/useWorkoutData";
import { AppLayout } from "@/components/layout/AppLayout";
import { DaySelector } from "@/components/workout/DaySelector";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { AddExerciseSheet } from "@/components/workout/AddExerciseSheet";
import { Loader2, Calendar, Zap, Dumbbell } from "lucide-react";
import { format } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const { workoutDays, loading: daysLoading } = useWorkoutDays();
  const [selectedDay, setSelectedDay] = useState(workoutDays[0] || null);
  const { exercises, loading: exercisesLoading, addExercise, deleteExercise } = useExercises(selectedDay?.id || null);
  const { sessions, createSession, getTodaySession } = useWorkoutSessions();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { logs, addSet, updateSet, deleteSet, refetch: refetchLogs } = useExerciseLogs(currentSessionId);

  useEffect(() => {
    if (workoutDays.length > 0 && !selectedDay) {
      setSelectedDay(workoutDays[0]);
    }
  }, [workoutDays, selectedDay]);

  useEffect(() => {
    const initSession = async () => {
      if (!selectedDay) return;

      const existingSession = await getTodaySession(selectedDay.id);
      if (existingSession) {
        setCurrentSessionId(existingSession.id);
      } else {
        const newSession = await createSession(selectedDay.id);
        if (newSession) {
          setCurrentSessionId(newSession.id);
        }
      }
    };

    initSession();
  }, [selectedDay?.id]);

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
          <div className="text-center space-y-3">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Zap className="h-10 w-10 text-primary relative" />
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (workoutDays.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">No workout days set up</p>
          <p className="text-sm text-muted-foreground">Please complete onboarding first.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1 fade-up">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{format(new Date(), "EEE, MMM d")}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Today's <span className="text-gradient">Workout</span>
          </h1>
        </div>

        {/* Day selector */}
        <DaySelector
          days={workoutDays}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />

        {/* Exercises */}
        {exercisesLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
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
              <div className="text-center py-10 fade-up">
                <div className="h-14 w-14 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-0.5">No exercises yet</p>
                <p className="text-xs text-muted-foreground mb-4">Add your first exercise to start</p>
              </div>
            )}

            <div className="fade-up pt-1">
              <AddExerciseSheet onAdd={handleAddExercise} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
