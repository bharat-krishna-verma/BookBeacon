import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface OccupancyPieChartProps {
    current: number;
    capacity: number;
}

export function OccupancyPieChart({ current, capacity }: OccupancyPieChartProps) {
    const available = Math.max(0, capacity - current);

    const data = [
        { name: 'Occupied', value: current },
        { name: 'Available', value: available },
    ];

    const COLORS = ['#a855f7', '#1e293b']; // Purple for occupied, dark for available

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Center text overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <div className="text-6xl font-bold gradient-text">
                        {current}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        of {capacity}
                    </div>
                </div>
            </div>
        </div>
    );
}
