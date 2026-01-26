import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWorkoutSessions, useAllExerciseLogs } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus, Dumbbell, Flame, Trophy, Calendar, Zap, Target } from "lucide-react";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";

type DateRange = "7d" | "14d" | "30d" | "90d";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 2 weeks" },
  { value: "30d", label: "Last month" },
  { value: "90d", label: "Last 3 months" },
];

export default function Dashboard() {
  const [range, setRange] = useState<DateRange>("30d");

  const dateRange = useMemo(() => {
    const end = new Date();
    const days = parseInt(range);
    const start = subDays(end, days);
    return { start, end };
  }, [range]);

  const { sessions, loading: sessionsLoading } = useWorkoutSessions(dateRange);
  const { logs, loading: logsLoading } = useAllExerciseLogs(dateRange);

  const loading = sessionsLoading || logsLoading;

  const stats = useMemo(() => {
    if (!logs.length) return null;

    const totalVolume = logs.reduce((sum, log) => sum + log.reps * log.weight, 0);
    const totalSets = logs.length;
    const totalWorkouts = sessions.length;

    const exerciseMap = new Map<string, typeof logs>();
    logs.forEach((log) => {
      const existing = exerciseMap.get(log.exercise_name) || [];
      existing.push(log);
      exerciseMap.set(log.exercise_name, existing);
    });

    const personalBests: { exercise: string; weight: number; reps: number }[] = [];
    exerciseMap.forEach((exerciseLogs, name) => {
      const best = exerciseLogs.reduce((max, log) => 
        log.weight > max.weight ? log : max, 
        exerciseLogs[0]
      );
      personalBests.push({ exercise: name, weight: best.weight, reps: best.reps });
    });

    const muscleGroups = new Map<string, number>();
    logs.forEach((log) => {
      const group = log.muscle_group || "Other";
      muscleGroups.set(group, (muscleGroups.get(group) || 0) + 1);
    });

    const thisWeekStart = startOfWeek(new Date());
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekStart, 1);

    const thisWeekVolume = logs
      .filter((l) => new Date(l.created_at) >= thisWeekStart)
      .reduce((sum, log) => sum + log.reps * log.weight, 0);

    const lastWeekVolume = logs
      .filter((l) => {
        const date = new Date(l.created_at);
        return date >= lastWeekStart && date <= lastWeekEnd;
      })
      .reduce((sum, log) => sum + log.reps * log.weight, 0);

    const weeklyChange = lastWeekVolume > 0 
      ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
      : 0;

    return {
      totalVolume,
      totalSets,
      totalWorkouts,
      personalBests: personalBests.sort((a, b) => b.weight - a.weight).slice(0, 5),
      muscleGroups: Array.from(muscleGroups.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      weeklyChange,
    };
  }, [logs, sessions]);

  const volumeChartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map((day) => {
      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.created_at);
        return format(logDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });
      
      const volume = dayLogs.reduce((sum, log) => sum + log.reps * log.weight, 0);
      
      return {
        date: format(day, "MMM d"),
        volume,
      };
    }).filter((d) => d.volume > 0);
  }, [logs, dateRange]);

  return (
    <AppLayout title="Progress">
      <div className="space-y-6">
        {/* Date range selector */}
        <div className="fade-up">
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="w-full h-12 bg-secondary/50 border-border/50 rounded-xl">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Zap className="h-10 w-10 text-primary relative" />
              </div>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
            </div>
          </div>
        ) : !stats ? (
          <div className="text-center py-16 fade-up">
            <div className="h-20 w-20 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No data yet</p>
            <p className="text-muted-foreground">Start logging workouts to track your progress</p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card fade-up">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-black text-foreground">{(stats.totalVolume / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground font-medium">Total Volume (kg)</p>
              </div>

              <div className="stat-card fade-up stagger-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className="h-8 w-8 rounded-lg bg-energy/10 flex items-center justify-center">
                    <Dumbbell className="h-4 w-4 text-energy" />
                  </div>
                </div>
                <p className="text-3xl font-black text-foreground">{stats.totalWorkouts}</p>
                <p className="text-xs text-muted-foreground font-medium">Workouts</p>
              </div>

              <div className="stat-card fade-up stagger-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-success" />
                  </div>
                </div>
                <p className="text-3xl font-black text-foreground">{stats.totalSets}</p>
                <p className="text-xs text-muted-foreground font-medium">Sets Completed</p>
              </div>

              <div className="stat-card fade-up stagger-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    stats.weeklyChange > 0 ? "bg-success/10" : stats.weeklyChange < 0 ? "bg-destructive/10" : "bg-secondary"
                  }`}>
                    {stats.weeklyChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : stats.weeklyChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className={`text-3xl font-black ${
                  stats.weeklyChange > 0 ? "text-success" : stats.weeklyChange < 0 ? "text-destructive" : "text-foreground"
                }`}>
                  {stats.weeklyChange > 0 ? "+" : ""}{stats.weeklyChange.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">vs Last Week</p>
              </div>
            </div>

            {/* Volume chart */}
            {volumeChartData.length > 0 && (
              <div className="glass-card rounded-2xl p-4 fade-up stagger-2">
                <h3 className="text-base font-bold text-foreground mb-4">Volume Over Time</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeChartData}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(168, 84%, 42%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(168, 84%, 42%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(240 10% 6%)',
                          border: '1px solid hsl(240 5% 16%)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px -4px rgba(0,0,0,0.3)',
                        }}
                        labelStyle={{ color: 'hsl(0 0% 98%)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="hsl(168, 84%, 42%)"
                        strokeWidth={3}
                        dot={false}
                        fill="url(#volumeGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Muscle group distribution */}
            {stats.muscleGroups.length > 0 && (
              <div className="glass-card rounded-2xl p-4 fade-up stagger-3">
                <h3 className="text-base font-bold text-foreground mb-4">Muscle Groups</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.muscleGroups} layout="vertical">
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(168, 84%, 42%)" />
                          <stop offset="100%" stopColor="hsl(192, 80%, 45%)" />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10, fill: 'hsl(240 5% 55%)' }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(240 10% 6%)',
                          border: '1px solid hsl(240 5% 16%)',
                          borderRadius: '12px',
                        }}
                        formatter={(value: number) => [`${value} sets`, 'Sets']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#barGradient)"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Personal bests */}
            {stats.personalBests.length > 0 && (
              <div className="glass-card rounded-2xl p-4 fade-up stagger-4">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-pr" />
                  Personal Bests
                </h3>
                <div className="space-y-2">
                  {stats.personalBests.map((pb, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-semibold text-foreground">{pb.exercise}</span>
                      <span className="text-sm">
                        <span className="text-muted-foreground">{pb.reps} × </span>
                        <span className="text-lg font-bold text-gradient-gold">{pb.weight}</span>
                        <span className="text-muted-foreground"> kg</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
