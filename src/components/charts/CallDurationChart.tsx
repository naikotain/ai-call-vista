import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', duration: 4.2 },
  { name: 'Mar', duration: 5.1 },
  { name: 'Mié', duration: 3.8 },
  { name: 'Jue', duration: 4.5 },
  { name: 'Vie', duration: 4.9 },
  { name: 'Sáb', duration: 6.2 },
  { name: 'Dom', duration: 5.7 },
];

export const CallDurationChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
            formatter={(value) => [`${value} min`, 'Duración promedio']}
          />
          <Bar 
            dataKey="duration" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};