import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutDays, useExercises, useWorkoutSessions, useExerciseLogs } from "@/hooks/useWorkoutData";
import { AppLayout } from "@/components/layout/AppLayout";
import { DaySelector } from "@/components/workout/DaySelector";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { AddExerciseSheet } from "@/components/workout/AddExerciseSheet";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const { workoutDays, loading: daysLoading } = useWorkoutDays();
  const [selectedDay, setSelectedDay] = useState(workoutDays[0] || null);
  const { exercises, loading: exercisesLoading, addExercise, deleteExercise } = useExercises(selectedDay?.id || null);
  const { sessions, createSession, getTodaySession } = useWorkoutSessions();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { logs, addSet, updateSet, deleteSet, refetch: refetchLogs } = useExerciseLogs(currentSessionId);

  // Set default selected day
  useEffect(() => {
    if (workoutDays.length > 0 && !selectedDay) {
      setSelectedDay(workoutDays[0]);
    }
  }, [workoutDays, selectedDay]);

  // Get or create today's session when day changes
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

  // Refetch logs when session changes
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
      <AppLayout title="Workout">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (workoutDays.length === 0) {
    return (
      <AppLayout title="Workout">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No workout days set up.</p>
          <p className="text-sm text-muted-foreground">Please complete onboarding.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{format(new Date(), "EEEE, MMMM d")}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Today's Workout</h1>
        </div>

        {/* Day selector */}
        <DaySelector
          days={workoutDays}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />

        {/* Exercises */}
        {exercisesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => {
              const exerciseLogs = logs.filter((l) => l.exercise_id === exercise.id);
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  sets={exerciseLogs}
                  onAddSet={(data) => handleAddSet(exercise.id, exercise.name, exercise.muscle_group, data)}
                  onUpdateSet={updateSet}
                  onDeleteSet={deleteSet}
                  onDeleteExercise={() => deleteExercise(exercise.id)}
                />
              );
            })}

            {exercises.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No exercises for this day yet.</p>
                <p className="text-sm">Add your first exercise below!</p>
              </div>
            )}

            <AddExerciseSheet onAdd={handleAddExercise} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
