import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRightIcon, ArrowLeftIcon, Users, TrendingUp, LogOut, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { OccupancyStats } from "@shared/schema";
import { useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import { queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OccupancyChart } from "@/components/OccupancyChart";
import { OccupancyPieChart } from "@/components/OccupancyPieChart";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { getToken } = useClerkAuth();
  const { signOut } = useClerk();

  // Historical occupancy data for the chart
  const [occupancyHistory, setOccupancyHistory] = useState<Array<{ time: string; occupancy: number }>>([]);

  // ... (rest of the component)

  const { data: stats, isLoading, isError, error } = useQuery<OccupancyStats>({
    queryKey: ["/api/occupancy"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch("/api/occupancy", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch occupancy data");
      }

      return res.json();
    },
    refetchInterval: 5000,
  });

  // Update occupancy history when stats change
  useEffect(() => {
    if (stats) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      setOccupancyHistory(prev => {
        const newHistory = [...prev, { time: timeString, occupancy: stats.current }];
        // Keep only last 20 data points
        return newHistory.slice(-20);
      });
    }
  }, [stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent glow-purple" data-testid="loading-spinner" />
          <p className="text-sm text-muted-foreground">Loading occupancy data...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <Card className="max-w-md mx-4 glass-strong" data-testid="card-error">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Connection Error</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Unable to connect to the RFID API. Please check your connection and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "from-emerald-500 to-teal-500";
      case "medium":
        return "from-amber-500 to-orange-500";
      case "high":
        return "from-rose-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "low":
        return "Low Capacity";
      case "medium":
        return "Medium Capacity";
      case "high":
        return "High Capacity";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-purple">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text" data-testid="text-header-title">
                Library Occupancy
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time visitor tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 animate-pulse"
              data-testid="badge-live-status"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 glow-cyan" />
              <span className="text-sm font-medium text-emerald-300">Live</span>
            </Badge>
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await fetch("/api/rfid-logs/simulate?count=5");
                      queryClient.invalidateQueries({ queryKey: ["/api/occupancy"] });
                    } catch (err) {
                      console.error("Simulation failed", err);
                    }
                  }}
                  className="gap-2 glass hover:glass-strong transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Simulate
                </Button>
                <Avatar className="h-9 w-9 ring-2 ring-purple-500/50" data-testid="avatar-user">
                  <AvatarImage src={user.imageUrl || undefined} style={{ objectFit: "cover" }} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  data-testid="button-logout"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Top Section - 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Occupancy Trends Chart */}
          {occupancyHistory.length > 0 && (
            <OccupancyChart data={occupancyHistory} capacity={stats.capacity} />
          )}

          {/* Right - Main Occupancy Card */}
          <Card className="border-2 glass-strong gradient-border glow-purple" data-testid="card-main-occupancy">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Pie Chart */}
                <div className="flex justify-center">
                  <OccupancyPieChart current={stats.current} capacity={stats.capacity} />
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-base font-medium text-muted-foreground mb-2">
                      People Currently Inside
                    </p>
                    <div className="text-6xl font-bold gradient-text tabular-nums">
                      {stats.current}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium text-foreground">
                        {stats.percentage}% ({stats.current} / {stats.capacity})
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={stats.percentage}
                        className="h-4 glass"
                        data-testid="progress-capacity"
                      />
                      <div
                        className={`absolute inset-0 h-4 rounded-full bg-gradient-to-r ${getStatusColor(stats.status)} opacity-70 transition-all`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Badge
                        className={`px-6 py-2 text-sm font-semibold bg-gradient-to-r ${getStatusColor(stats.status)} border-0 text-white`}
                        data-testid="badge-capacity-status"
                      >
                        {getStatusText(stats.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground text-center" data-testid="text-last-updated">
                      Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-strong gradient-border hover:glow-cyan transition-all duration-300" data-testid="card-total-entries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Entries Today
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ArrowRightIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text" data-testid="text-total-in">
                {stats.totalIn}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                People entered
              </p>
            </CardContent>
          </Card>

          <Card className="glass-strong gradient-border hover:glow-pink transition-all duration-300" data-testid="card-total-exits">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Exits Today
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <ArrowLeftIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text" data-testid="text-total-out">
                {stats.totalOut}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                People exited
              </p>
            </CardContent>
          </Card>

          <Card className="glass-strong gradient-border hover:glow-purple transition-all duration-300" data-testid="card-peak-occupancy">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peak Occupancy
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text" data-testid="text-peak-occupancy">
                {stats.peak}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Highest today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Status Card */}
        <Card className="glass" data-testid="card-api-status">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse glow-cyan" />
                <span className="text-sm font-medium text-foreground">
                  Connected to RFID API
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Refreshing every 5 seconds
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
