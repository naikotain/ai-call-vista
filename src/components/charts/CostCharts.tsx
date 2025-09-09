// components/CostCharts.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostChartsProps {
  costMetrics: {
    costoPorAgente: Array<{
      agente: string;
      costo: number;
      llamadas: number;
      costoPromedio: number;
    }>;
    costoPorDia: Array<{
      name: string;
      costo: number;
    }>;
    costoPorTipo: {
      inbound: number;
      outbound: number;
    };
  };
  loading?: boolean;
}

export const CostCharts = ({ costMetrics, loading = false }: CostChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
        <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const agentData = costMetrics.costoPorAgente.map(agent => ({
    name: agent.agente,
    costo: agent.costo,
    llamadas: agent.llamadas
  }));

  const tipoData = [
    { name: 'Entrantes', costo: costMetrics.costoPorTipo.inbound },
    { name: 'Salientes', costo: costMetrics.costoPorTipo.outbound }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de costos por agente */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Costo por Agente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
              <Legend />
              <Bar dataKey="costo" fill="#3b82f6" name="Costo Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de costos por tipo */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Costo por Tipo de Llamada</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tipoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Costo']} />
              <Legend />
              <Bar dataKey="costo" fill="#10b981" name="Costo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detallada de costos por agente */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Desglose Detallado de Costos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Agente</th>
                <th className="text-right py-2">Llamadas</th>
                <th className="text-right py-2">Costo Total</th>
                <th className="text-right py-2">Costo Promedio</th>
              </tr>
            </thead>
            <tbody>
              {costMetrics.costoPorAgente.map((agent, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{agent.agente}</td>
                  <td className="text-right py-2">{agent.llamadas}</td>
                  <td className="text-right py-2">${agent.costo.toFixed(4)}</td>
                  <td className="text-right py-2">${agent.costoPromedio.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};