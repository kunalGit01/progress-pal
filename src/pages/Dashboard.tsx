import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWorkoutSessions, useAllExerciseLogs, useWorkoutDays, ExerciseLogWithDate } from "@/hooks/useWorkoutData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
  CartesianGrid, Legend
} from "recharts";
import { 
  Loader2, TrendingUp, TrendingDown, Minus, Dumbbell, Flame, Trophy, 
  Calendar, Zap, Target, Activity, BarChart3, PieChartIcon, Clock,
  Award, ChevronUp, ChevronDown
} from "lucide-react";
import { format, subDays, startOfWeek, eachDayOfInterval, eachWeekOfInterval, getDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "14d" | "30d" | "90d";

const DATE_RANGES: { value: DateRange; label: string; days: number }[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "14d", label: "Last 2 weeks", days: 14 },
  { value: "30d", label: "Last month", days: 30 },
  { value: "90d", label: "Last 3 months", days: 90 },
];

const CHART_COLORS = [
  "hsl(168, 84%, 42%)",  // primary
  "hsl(192, 80%, 45%)",  // cyan
  "hsl(45, 93%, 47%)",   // gold
  "hsl(280, 65%, 55%)",  // purple
  "hsl(340, 75%, 55%)",  // pink
  "hsl(25, 95%, 53%)",   // orange
];

export default function Dashboard() {
  const [range, setRange] = useState<DateRange>("30d");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const dateRange = useMemo(() => {
    const end = new Date();
    const days = parseInt(range);
    const start = subDays(end, days);
    return { start, end };
  }, [range]);

  const { sessions, loading: sessionsLoading } = useWorkoutSessions(dateRange);
  const { logs, loading: logsLoading } = useAllExerciseLogs(dateRange);
  const { workoutDays } = useWorkoutDays();

  const loading = sessionsLoading || logsLoading;

  // All unique exercises for filter
  const uniqueExercises = useMemo(() => {
    const exercises = new Set(logs.map(l => l.exercise_name));
    return Array.from(exercises).sort();
  }, [logs]);

  // Core stats
  const stats = useMemo(() => {
    if (!logs.length) return null;

    const totalVolume = logs.reduce((sum, log) => sum + log.weight, 0);
    const totalSets = logs.length;
    const totalReps = logs.reduce((sum, log) => sum + log.reps, 0);
    const totalWorkouts = sessions.length;
    const avgSetsPerWorkout = totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0;
    const avgVolumePerWorkout = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    // Exercise breakdown
    const exerciseMap = new Map<string, typeof logs>();
    logs.forEach((log) => {
      const existing = exerciseMap.get(log.exercise_name) || [];
      existing.push(log);
      exerciseMap.set(log.exercise_name, existing);
    });

    // Personal bests with improvement tracking
    const personalBests: { exercise: string; weight: number; reps: number; volume: number }[] = [];
    exerciseMap.forEach((exerciseLogs, name) => {
      const best = exerciseLogs.reduce((max, log) => 
        log.weight > max.weight ? log : max, 
        exerciseLogs[0]
      );
      const totalExVolume = exerciseLogs.reduce((sum, l) => sum + l.reps * l.weight, 0);
      personalBests.push({ exercise: name, weight: best.weight, reps: best.reps, volume: totalExVolume });
    });

    // Muscle groups distribution
    const muscleGroups = new Map<string, { sets: number; volume: number }>();
    logs.forEach((log) => {
      const group = log.muscle_group || "Other";
      const existing = muscleGroups.get(group) || { sets: 0, volume: 0 };
      existing.sets += 1;
      existing.volume += log.reps * log.weight;
      muscleGroups.set(group, existing);
    });

    // Weekly comparison - use session_date for accurate date filtering
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekStart, 1);

    const getLogDate = (log: ExerciseLogWithDate) => new Date(log.session_date || log.created_at!);

    const thisWeekVolume = logs
      .filter((l) => getLogDate(l) >= thisWeekStart)
      .reduce((sum, log) => sum + log.reps * log.weight, 0);

    const thisWeekSets = logs.filter((l) => getLogDate(l) >= thisWeekStart).length;

    const lastWeekVolume = logs
      .filter((l) => {
        const date = getLogDate(l);
        return date >= lastWeekStart && date <= lastWeekEnd;
      })
      .reduce((sum, log) => sum + log.reps * log.weight, 0);

    const lastWeekSets = logs.filter((l) => {
      const date = getLogDate(l);
      return date >= lastWeekStart && date <= lastWeekEnd;
    }).length;

    const weeklyVolumeChange = lastWeekVolume > 0 
      ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
      : 0;

    const weeklySetsChange = lastWeekSets > 0
      ? ((thisWeekSets - lastWeekSets) / lastWeekSets) * 100
      : 0;

    // Consistency score (workouts per week average)
    const totalDays = differenceInDays(dateRange.end, dateRange.start) || 1;
    const weeksInRange = totalDays / 7;
    const workoutsPerWeek = totalWorkouts / weeksInRange;
    const consistencyScore = Math.min(100, Math.round((workoutsPerWeek / (workoutDays.length || 4)) * 100));

    return {
      totalVolume,
      totalSets,
      totalReps,
      totalWorkouts,
      avgSetsPerWorkout,
      avgVolumePerWorkout,
      personalBests: personalBests.sort((a, b) => b.weight - a.weight),
      muscleGroups: Array.from(muscleGroups.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.sets - a.sets),
      weeklyVolumeChange,
      weeklySetsChange,
      thisWeekVolume,
      thisWeekSets,
      consistencyScore,
      workoutsPerWeek: workoutsPerWeek.toFixed(1),
    };
  }, [logs, sessions, dateRange, workoutDays]);

  // Volume over time (daily) - use session_date for accurate grouping
  const volumeChartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayLogs = logs.filter((log) => {
        const logDate = log.session_date || log.created_at?.split("T")[0];
        return logDate === dayStr;
      });
      
      const volume = dayLogs.reduce((sum, log) => sum + log.reps * log.weight, 0);
      const sets = dayLogs.length;
      
      return {
        date: format(day, "MMM d"),
        fullDate: dayStr,
        volume,
        sets,
      };
    });
  }, [logs, dateRange]);

  // Weekly aggregated data - use session_date for accuracy
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end }, { weekStartsOn: 1 });
    
    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.session_date || log.created_at!);
        return logDate >= weekStart && logDate <= weekEnd;
      });
      
      const volume = weekLogs.reduce((sum, log) => sum + log.reps * log.weight, 0);
      const sets = weekLogs.length;
      const workouts = sessions.filter(s => {
        const sDate = new Date(s.date);
        return sDate >= weekStart && sDate <= weekEnd;
      }).length;
      
      return {
        week: format(weekStart, "MMM d"),
        volume,
        sets,
        workouts,
        avgVolume: workouts > 0 ? Math.round(volume / workouts) : 0,
      };
    });
  }, [logs, sessions, dateRange]);

  // Day of week distribution (heatmap data) - use session_date
  const dayOfWeekData = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayCounts = new Array(7).fill(0);
    const dayVolumes = new Array(7).fill(0);
    
    sessions.forEach((session) => {
      const dayIndex = getDay(new Date(session.date));
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Mon=0
      dayCounts[adjustedIndex]++;
    });

    logs.forEach((log) => {
      const logDate = log.session_date || log.created_at!;
      const dayIndex = getDay(new Date(logDate));
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      dayVolumes[adjustedIndex] += log.reps * log.weight;
    });

    return dayNames.map((name, idx) => ({
      day: name,
      workouts: dayCounts[idx],
      volume: dayVolumes[idx],
      fullMark: Math.max(...dayCounts) || 1,
    }));
  }, [sessions, logs]);

  // Exercise progression data - use session_date for accurate sorting
  const exerciseProgressionData = useMemo(() => {
    if (!selectedExercise) return [];

    const exerciseLogs = logs
      .filter(l => l.exercise_name === selectedExercise)
      .sort((a, b) => {
        const dateA = new Date(a.session_date || a.created_at!);
        const dateB = new Date(b.session_date || b.created_at!);
        return dateA.getTime() - dateB.getTime();
      });

    // Group by session date and get max weight per day
    const dateMap = new Map<string, { maxWeight: number; totalVolume: number; sets: number }>();
    
    exerciseLogs.forEach(log => {
      const logDate = log.session_date || log.created_at!;
      const date = format(new Date(logDate), "MMM d");
      const existing = dateMap.get(date) || { maxWeight: 0, totalVolume: 0, sets: 0 };
      existing.maxWeight = Math.max(existing.maxWeight, log.weight);
      existing.totalVolume += log.weight;
      existing.sets += 1;
      dateMap.set(date, existing);
    });

    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      maxWeight: data.maxWeight,
      volume: data.totalVolume,
      sets: data.sets,
    }));
  }, [logs, selectedExercise]);

  // Muscle group pie data
  const muscleGroupPieData = useMemo(() => {
    if (!stats?.muscleGroups) return [];
    const totalSets = stats.muscleGroups.reduce((sum, g) => sum + g.sets, 0);
    return stats.muscleGroups.map((g, idx) => ({
      name: g.name,
      value: g.sets,
      percentage: ((g.sets / totalSets) * 100).toFixed(1),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [stats]);

  // Rep range distribution
  const repRangeData = useMemo(() => {
    const ranges = [
      { name: "1-5", min: 1, max: 5, count: 0, label: "Strength" },
      { name: "6-8", min: 6, max: 8, count: 0, label: "Power" },
      { name: "9-12", min: 9, max: 12, count: 0, label: "Hypertrophy" },
      { name: "13-15", min: 13, max: 15, count: 0, label: "Endurance" },
      { name: "16+", min: 16, max: 100, count: 0, label: "High Rep" },
    ];

    logs.forEach(log => {
      const range = ranges.find(r => log.reps >= r.min && log.reps <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [logs]);

  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    change, 
    iconBg, 
    iconColor,
    delay = 0 
  }: { 
    icon: any; 
    value: string | number; 
    label: string; 
    change?: number;
    iconBg: string;
    iconColor: string;
    delay?: number;
  }) => (
    <div className="stat-card fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            change > 0 ? "bg-success/20 text-success" : 
            change < 0 ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"
          )}>
            {change > 0 ? <ChevronUp className="h-3 w-3" /> : 
             change < 0 ? <ChevronDown className="h-3 w-3" /> : null}
            {Math.abs(change).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl p-3 shadow-xl pointer-events-none" style={{ outline: 'none' }}>
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}: </span>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {entry.name.toLowerCase().includes('volume') ? ' kg' : ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <AppLayout title="Analytics">
      <div className="space-y-4">
        {/* Header controls */}
        <div className="flex gap-2 fade-up">
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="flex-1 h-10 bg-secondary/50 border-border/30 rounded-xl text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
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
            <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No data yet</p>
            <p className="text-sm text-muted-foreground">Start logging workouts to track progress</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="fade-up">
              <TabsList className="w-full grid grid-cols-3 h-10 bg-secondary/30 rounded-xl p-1">
                <TabsTrigger value="overview" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="breakdown" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Breakdown
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Key stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  <StatCard 
                    icon={Flame} 
                    value={stats.totalVolume >= 1000 
                      ? `${(stats.totalVolume / 1000).toFixed(1)}k` 
                      : `${Math.round(stats.totalVolume)}`}
                    label="Total Volume (kg)"
                    change={stats.weeklyVolumeChange}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    delay={0}
                  />
                  <StatCard 
                    icon={Dumbbell} 
                    value={stats.totalWorkouts}
                    label="Workouts"
                    iconBg="bg-energy/10"
                    iconColor="text-energy"
                    delay={0.05}
                  />
                  <StatCard 
                    icon={Activity} 
                    value={stats.totalSets}
                    label="Total Sets"
                    change={stats.weeklySetsChange}
                    iconBg="bg-success/10"
                    iconColor="text-success"
                    delay={0.1}
                  />
                  <StatCard 
                    icon={Target} 
                    value={`${stats.consistencyScore}%`}
                    label="Consistency"
                    iconBg="bg-pr/10"
                    iconColor="text-pr"
                    delay={0.15}
                  />
                </div>

                {/* This week summary */}
                <div className="glass-card rounded-xl p-3 fade-up" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    This Week
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xl font-black text-foreground">{stats.thisWeekSets}</p>
                      <p className="text-[10px] text-muted-foreground">Sets</p>
                    </div>
                    <div className="text-center border-x border-border/30">
                      <p className="text-xl font-black text-foreground">
                        {stats.thisWeekVolume >= 1000 
                          ? `${(stats.thisWeekVolume / 1000).toFixed(1)}k` 
                          : `${Math.round(stats.thisWeekVolume)}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Volume (kg)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-foreground">{stats.workoutsPerWeek}</p>
                      <p className="text-[10px] text-muted-foreground">Avg/Week</p>
                    </div>
                  </div>
                </div>

                {/* Volume trend area chart */}
                {volumeChartData.some(d => d.volume > 0) && (
                  <div className="glass-card rounded-xl p-3 fade-up" style={{ animationDelay: '0.25s' }}>
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      Volume Trend
                    </h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeChartData.filter(d => d.volume > 0)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="volumeArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(168, 84%, 42%)" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="hsl(168, 84%, 42%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ outline: 'none' }} />
                          <Area 
                            type="monotone" 
                            dataKey="volume" 
                            name="Volume"
                            stroke="hsl(168, 84%, 42%)"
                            strokeWidth={2}
                            fill="url(#volumeArea)"
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Day distribution radar */}
                <div className="glass-card rounded-xl p-3 fade-up" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Training Days
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={dayOfWeekData}>
                        <PolarGrid stroke="hsl(240 5% 20%)" />
                        <PolarAngleAxis 
                          dataKey="day" 
                          tick={{ fontSize: 10, fill: 'hsl(240 5% 65%)' }}
                        />
                        <PolarRadiusAxis 
                          tick={{ fontSize: 8, fill: 'hsl(240 5% 45%)' }}
                          axisLine={false}
                        />
                        <Radar
                          name="Workouts"
                          dataKey="workouts"
                          stroke="hsl(168, 84%, 42%)"
                          fill="hsl(168, 84%, 42%)"
                          fillOpacity={0.4}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ outline: 'none' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4 mt-4">
                {/* Exercise selector */}
                <div className="fade-up">
                  <Select value={selectedExercise || ""} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="w-full h-10 bg-secondary/50 border-border/30 rounded-xl text-xs">
                      <Dumbbell className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      <SelectValue placeholder="Select exercise to track" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueExercises.map((ex) => (
                        <SelectItem key={ex} value={ex} className="text-xs">
                          {ex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Exercise progression chart */}
                {selectedExercise && exerciseProgressionData.length > 0 ? (
                  <div className="glass-card rounded-xl p-3 fade-up">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      {selectedExercise} Progress
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={exerciseProgressionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            yAxisId="left"
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            width={30}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            width={30}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ outline: 'none' }} />
                          <Legend 
                            wrapperStyle={{ fontSize: '10px' }}
                            iconSize={8}
                          />
                          <Bar 
                            yAxisId="right"
                            dataKey="volume" 
                            name="Volume"
                            fill="hsl(168, 84%, 42%)"
                            fillOpacity={0.3}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={false}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="maxWeight" 
                            name="Max Weight"
                            stroke="hsl(45, 93%, 47%)"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(45, 93%, 47%)', r: 3 }}
                            isAnimationActive={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 fade-up">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Select an exercise to view progress</p>
                  </div>
                )}

                {/* Weekly comparison */}
                {weeklyData.length > 1 && (
                  <div className="glass-card rounded-xl p-3 fade-up">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      Weekly Comparison
                    </h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" opacity={0.3} />
                          <XAxis 
                            dataKey="week" 
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="volume" 
                            name="Volume"
                            fill="hsl(168, 84%, 42%)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Personal bests */}
                {stats.personalBests.length > 0 && (
                  <div className="glass-card rounded-xl p-3 fade-up">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-pr" />
                      Top Lifts
                    </h3>
                    <div className="space-y-1.5">
                      {stats.personalBests.slice(0, 5).map((pb, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedExercise(pb.exercise)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                              idx === 0 ? "bg-pr/20 text-pr" :
                              idx === 1 ? "bg-secondary text-muted-foreground" :
                              "bg-secondary/50 text-muted-foreground"
                            )}>
                              {idx + 1}
                            </span>
                            <span className="text-xs font-medium text-foreground">{pb.exercise}</span>
                          </div>
                          <span className="text-xs">
                            <span className="font-bold text-gradient-gold">{pb.weight}</span>
                            <span className="text-muted-foreground"> kg × {pb.reps}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Breakdown Tab */}
              <TabsContent value="breakdown" className="space-y-4 mt-4">
                {/* Muscle group pie chart */}
                {muscleGroupPieData.length > 0 && (
                  <div className="glass-card rounded-xl p-3 fade-up">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <PieChartIcon className="h-3.5 w-3.5 text-primary" />
                      Muscle Distribution
                    </h3>
                    <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={muscleGroupPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {muscleGroupPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card/95 backdrop-blur-lg border border-border/50 rounded-lg p-2 shadow-xl pointer-events-none" style={{ outline: 'none' }}>
                                  <p className="text-xs font-semibold" style={{ color: data.color }}>{data.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{data.value} sets ({data.percentage}%)</p>
                                </div>
                              );
                            }}
                            cursor={false}
                            wrapperStyle={{ outline: 'none' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{stats.totalSets}</p>
                          <p className="text-[9px] text-muted-foreground">Total Sets</p>
                        </div>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {muscleGroupPieData.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rep range distribution */}
                <div className="glass-card rounded-xl p-3 fade-up">
                  <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    Rep Range Distribution
                  </h3>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={repRangeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" opacity={0.3} horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                          axisLine={false}
                          tickLine={false}
                          width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          name="Sets"
                          fill="hsl(192, 80%, 45%)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    {repRangeData.map((r, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-[9px] text-muted-foreground">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Muscle volume breakdown */}
                {stats.muscleGroups.length > 0 && (
                  <div className="glass-card rounded-xl p-3 fade-up">
                    <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      Volume by Muscle
                    </h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.muscleGroups.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 10, left: 55, bottom: 0 }}>
                          <defs>
                            <linearGradient id="muscleGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(168, 84%, 42%)" />
                              <stop offset="100%" stopColor="hsl(192, 80%, 45%)" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" opacity={0.3} horizontal={false} />
                          <XAxis 
                            type="number"
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          />
                          <YAxis 
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 9, fill: 'hsl(240 5% 55%)' }}
                            axisLine={false}
                            tickLine={false}
                            width={55}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card/95 backdrop-blur-lg border border-border/50 rounded-lg p-2 shadow-xl pointer-events-none" style={{ outline: 'none' }}>
                                  <p className="text-xs font-semibold text-foreground">{data.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{data.volume.toLocaleString()} kg volume</p>
                                  <p className="text-[10px] text-muted-foreground">{data.sets} sets</p>
                                </div>
                              );
                            }}
                            cursor={false}
                            wrapperStyle={{ outline: 'none' }}
                          />
                          <Bar 
                            dataKey="volume" 
                            fill="url(#muscleGradient)"
                            radius={[0, 6, 6, 0]}
                            isAnimationActive={false}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Stats summary cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-card rounded-xl p-3 text-center fade-up">
                    <p className="text-lg font-black text-foreground">{stats.avgSetsPerWorkout}</p>
                    <p className="text-[10px] text-muted-foreground">Avg Sets/Workout</p>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center fade-up">
                    <p className="text-lg font-black text-foreground">{(stats.avgVolumePerWorkout / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-muted-foreground">Avg Volume/Workout</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
