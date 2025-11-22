import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface OccupancyDataPoint {
    time: string;
    occupancy: number;
}

interface OccupancyChartProps {
    data: OccupancyDataPoint[];
    capacity: number;
}

export function OccupancyChart({ data, capacity }: OccupancyChartProps) {
    return (
        <Card className="glass-strong gradient-border" data-testid="card-occupancy-chart">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                    Occupancy Trends
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
                        <XAxis
                            dataKey="time"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            domain={[0, capacity]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(12px)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="occupancy"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fill="url(#colorOccupancy)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Real-time occupancy tracking</span>
                    <span>Capacity: {capacity}</span>
                </div>
            </CardContent>
        </Card>
    );
}
