import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Cliente colgó', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Problema técnico', value: 20, color: 'hsl(var(--danger))' },
  { name: 'Agente colgó', value: 15, color: 'hsl(var(--warning))' },
  { name: 'Llamada transferida', value: 12, color: 'hsl(var(--success))' },
  { name: 'Tiempo excedido', value: 8, color: 'hsl(var(--secondary))' },
];

export const DisconnectionChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};