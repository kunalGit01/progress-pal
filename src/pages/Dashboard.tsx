import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWorkoutSessions, useAllExerciseLogs } from "@/hooks/useWorkoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus, Dumbbell, Flame, Trophy, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

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

  // Calculate stats
  const stats = useMemo(() => {
    if (!logs.length) return null;

    const totalVolume = logs.reduce((sum, log) => sum + log.reps * log.weight, 0);
    const totalSets = logs.length;
    const totalWorkouts = sessions.length;

    // Group by exercise to find trends
    const exerciseMap = new Map<string, typeof logs>();
    logs.forEach((log) => {
      const existing = exerciseMap.get(log.exercise_name) || [];
      existing.push(log);
      exerciseMap.set(log.exercise_name, existing);
    });

    // Find personal bests (highest weight for each exercise)
    const personalBests: { exercise: string; weight: number; reps: number }[] = [];
    exerciseMap.forEach((exerciseLogs, name) => {
      const best = exerciseLogs.reduce((max, log) => 
        log.weight > max.weight ? log : max, 
        exerciseLogs[0]
      );
      personalBests.push({ exercise: name, weight: best.weight, reps: best.reps });
    });

    // Group by muscle group
    const muscleGroups = new Map<string, number>();
    logs.forEach((log) => {
      const group = log.muscle_group || "Other";
      muscleGroups.set(group, (muscleGroups.get(group) || 0) + 1);
    });

    // Calculate weekly comparison
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

  // Volume over time chart data
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
        <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
          <SelectTrigger className="w-full h-12">
            <Calendar className="h-4 w-4 mr-2" />
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !stats ? (
          <div className="text-center py-16 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No workout data yet</p>
            <p className="text-sm">Start logging your workouts to see progress!</p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="stat-glow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-medium">Total Volume</span>
                  </div>
                  <p className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">kg lifted</p>
                </CardContent>
              </Card>

              <Card className="stat-glow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Dumbbell className="h-4 w-4" />
                    <span className="text-xs font-medium">Workouts</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">sessions</p>
                </CardContent>
              </Card>

              <Card className="stat-glow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-medium">Total Sets</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalSets}</p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </CardContent>
              </Card>

              <Card className="stat-glow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {stats.weeklyChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : stats.weeklyChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">Week Change</span>
                  </div>
                  <p className={`text-2xl font-bold ${stats.weeklyChange > 0 ? "text-success" : stats.weeklyChange < 0 ? "text-destructive" : ""}`}>
                    {stats.weeklyChange > 0 ? "+" : ""}{stats.weeklyChange.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Volume chart */}
            {volumeChartData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Volume Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={volumeChartData}>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Muscle group distribution */}
            {stats.muscleGroups.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Muscle Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.muscleGroups} layout="vertical">
                        <XAxis 
                          type="number"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value} sets`, 'Sets']}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="hsl(var(--primary))"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal bests */}
            {stats.personalBests.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-pr" />
                    Personal Bests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.personalBests.map((pb, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-sm">{pb.exercise}</span>
                        <span className="text-sm text-muted-foreground">
                          {pb.reps} × <span className="text-foreground font-bold">{pb.weight}</span> kg
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
