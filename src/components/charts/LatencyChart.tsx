import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { name: 'Lun', latency: 1.2 },
  { name: 'Mar', latency: 1.5 },
  { name: 'Mié', latency: 1.3 },
  { name: 'Jue', latency: 1.1 },
  { name: 'Vie', latency: 0.9 },
  { name: 'Sáb', latency: 1.4 },
  { name: 'Dom', latency: 1.6 },
];

export const LatencyChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0.05}/>
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
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${value}s`, 'Latencia']}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="hsl(var(--info))"
            fillOpacity={1}
            fill="url(#latencyGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};