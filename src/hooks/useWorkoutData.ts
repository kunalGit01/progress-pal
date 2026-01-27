import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkoutDay {
  id: string;
  user_id: string;
  day_number: number;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  workout_day_id: string;
  name: string;
  muscle_group: string | null;
  sort_order: number;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_day_id: string | null;
  date: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  workout_session_id: string;
  exercise_id: string | null;
  exercise_name: string;
  muscle_group: string | null;
  set_number: number;
  reps: number;
  weight: number;
  is_pr: boolean;
  created_at: string;
}

export function useWorkoutDays() {
  const { user } = useAuth();
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkoutDays = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("workout_days")
      .select("*")
      .eq("user_id", user.id)
      .order("day_number");

    if (!error && data) {
      setWorkoutDays(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkoutDays();
  }, [user]);

  return { workoutDays, loading, refetch: fetchWorkoutDays };
}

export function useExercises(workoutDayId: string | null) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    if (!user || !workoutDayId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_day_id", workoutDayId)
      .order("sort_order");

    if (!error && data) {
      setExercises(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, [user, workoutDayId]);

  const addExercise = async (name: string, muscleGroup?: string) => {
    if (!user || !workoutDayId) return null;

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        user_id: user.id,
        workout_day_id: workoutDayId,
        name,
        muscle_group: muscleGroup || null,
        sort_order: exercises.length,
      })
      .select()
      .single();

    if (!error && data) {
      setExercises([...exercises, data]);
      return data;
    }
    return null;
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    const { error } = await supabase
      .from("exercises")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setExercises(exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    }
  };

  const deleteExercise = async (id: string) => {
    const { error } = await supabase.from("exercises").delete().eq("id", id);

    if (!error) {
      setExercises(exercises.filter((e) => e.id !== id));
    }
  };

  return { exercises, loading, refetch: fetchExercises, addExercise, updateExercise, deleteExercise };
}

export function useWorkoutSessions(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;

    let query = supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (dateRange) {
      query = query
        .gte("date", dateRange.start.toISOString().split("T")[0])
        .lte("date", dateRange.end.toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user, dateRange?.start.toISOString(), dateRange?.end.toISOString()]);

  const createSession = async (workoutDayId: string, date?: Date) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        workout_day_id: workoutDayId,
        date: (date || new Date()).toISOString().split("T")[0],
      })
      .select()
      .single();

    if (!error && data) {
      setSessions([data, ...sessions]);
      return data;
    }
    return null;
  };

  const getTodaySession = async (workoutDayId: string) => {
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_day_id", workoutDayId)
      .eq("date", today)
      .maybeSingle();

    return data;
  };

  const getSessionByDate = async (workoutDayId: string, date: Date) => {
    if (!user) return null;

    const dateStr = date.toISOString().split("T")[0];

    const { data } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_day_id", workoutDayId)
      .eq("date", dateStr)
      .maybeSingle();

    return data;
  };

  return { sessions, loading, refetch: fetchSessions, createSession, getTodaySession, getSessionByDate };
}

export function useExerciseLogs(sessionId: string | null) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user || !sessionId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_session_id", sessionId)
      .order("created_at");

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user, sessionId]);

  const addSet = async (data: {
    exerciseId: string | null;
    exerciseName: string;
    muscleGroup?: string;
    setNumber: number;
    reps: number;
    weight: number;
  }) => {
    if (!user || !sessionId) return null;

    const { data: newLog, error } = await supabase
      .from("exercise_logs")
      .insert({
        user_id: user.id,
        workout_session_id: sessionId,
        exercise_id: data.exerciseId,
        exercise_name: data.exerciseName,
        muscle_group: data.muscleGroup || null,
        set_number: data.setNumber,
        reps: data.reps,
        weight: data.weight,
      })
      .select()
      .single();

    if (!error && newLog) {
      setLogs([...logs, newLog]);
      return newLog;
    }
    return null;
  };

  const updateSet = async (id: string, updates: { reps?: number; weight?: number }) => {
    const { error } = await supabase
      .from("exercise_logs")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setLogs(logs.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    }
  };

  const deleteSet = async (id: string) => {
    const { error } = await supabase.from("exercise_logs").delete().eq("id", id);

    if (!error) {
      setLogs(logs.filter((l) => l.id !== id));
    }
  };

  return { logs, loading, refetch: fetchLogs, addSet, updateSet, deleteSet };
}

export function useAllExerciseLogs(dateRange?: { start: Date; end: Date }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) return;

    // First get sessions in date range
    let sessionsQuery = supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", user.id);

    if (dateRange) {
      sessionsQuery = sessionsQuery
        .gte("date", dateRange.start.toISOString().split("T")[0])
        .lte("date", dateRange.end.toISOString().split("T")[0]);
    }

    const { data: sessions } = await sessionsQuery;

    if (!sessions || sessions.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const sessionIds = sessions.map((s) => s.id);

    const { data, error } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("user_id", user.id)
      .in("workout_session_id", sessionIds)
      .order("created_at");

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user, dateRange?.start.toISOString(), dateRange?.end.toISOString()]);

  return { logs, loading, refetch: fetchLogs };
}
