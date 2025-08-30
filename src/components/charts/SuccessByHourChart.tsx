import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { name: '9:00', successRate: 72 },
  { name: '10:00', successRate: 78 },
  { name: '11:00', successRate: 82 },
  { name: '12:00', successRate: 80 },
  { name: '13:00', successRate: 75 },
  { name: '14:00', successRate: 85 },
  { name: '15:00', successRate: 88 },
  { name: '16:00', successRate: 83 },
  { name: '17:00', successRate: 79 },
];

export const SuccessByHourChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[50, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${value}%`, 'Tasa de éxito']}
          />
          <Area
            type="monotone"
            dataKey="successRate"
            stroke="hsl(var(--success))"
            fillOpacity={1}
            fill="url(#successGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};