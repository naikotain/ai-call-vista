import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { categorizeDisconnectReason } from '@/config/disconnect-categories';

export interface DisconnectionReason {
  reason: string;
  count: number;
  percentage: number;
  category: 'ended' | 'not_connected' | 'error';
}

interface DisconnectionReasonsChartProps {
  data: DisconnectionReason[];
}

// Colores optimizados para tema oscuro usando variables CSS
const CATEGORY_COLORS = {
  ended: 'hsl(var(--success))',      // Verde
  not_connected: 'hsl(var(--info))', // Azul info
  error: 'hsl(var(--danger))'        // Rojo
};

// Custom Tooltip para tema oscuro
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-metric">
        <p className="text-card-foreground font-medium">{label}</p>
        <p className="text-card-foreground">
          {payload[0].value} llamadas ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

// Custom Legend para tema oscuro
const renderColorfulLegendText = (value: string) => {
  return <span className="text-card-foreground text-sm">{value}</span>;
};

const getFriendlyReasonName = (reason: string): string => {
  const reasonNames: Record<string, string> = {
    'user_hangup': 'Cliente colgó',
    'agent_hangup': 'Agente colgó',
    'voicemail_reached': 'Buzón de voz',
    'inactivity': 'Inactividad',
    'max_duration_reached': 'Tiempo máximo excedido',
    'dial_busy': 'Línea ocupada',
    'dial_failed': 'Llamada fallida',
    'dial_no_answer': 'Sin respuesta',
    'invalid_destination': 'Destino inválido',
    'telephony_provider_permission_denied': 'Permiso denegado',
    'telephony_provider_unavailable': 'Proveedor no disponible',
    'sip_routing_error': 'Error de routing SIP',
    'marked_as_spam': 'Marcado como spam',
    'user_declined': 'Usuario rechazó',
    'concurrency_limit_reached': 'Límite de concurrencia',
    'no_valid_payment': 'Sin pago válido',
    'scam_detected': 'Scam detectado',
    'error_llm_websocket_open': 'Error conexión LLM',
    'error_llm_websocket_lost_connection': 'Conexión LLM perdida',
    'error_llm_websocket_runtime': 'Error runtime LLM',
    'error_llm_websocket_corrupt_payload': 'Payload corrupto LLM',
    'error_no_audio_received': 'Sin audio recibido',
    'error_asr': 'Error ASR',
    'error_retell': 'Error Retell',
    'error_unknown': 'Error desconocido',
    'error_user_not_joined': 'Usuario no se unió',
    'registered_call_timeout': 'Timeout de llamada',
    'call_ended_by_customer': 'Cliente finalizó llamada',
    'agent_ended_call': 'Agente finalizó llamada' 
  };
  
  return reasonNames[reason] || reason;
};

export const DisconnectionReasonsChart: React.FC<DisconnectionReasonsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Razones de Desconexión</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay datos de razones de desconexión disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por categoría
  const byCategory = data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DisconnectionReason[]>);

  // Datos para gráfico de categorías
  const categoryData = Object.entries(byCategory).map(([category, items]) => ({
    category,
    count: items.reduce((sum, item) => sum + item.count, 0),
    percentage: Math.round((items.reduce((sum, item) => sum + item.count, 0) / data.reduce((sum, item) => sum + item.count, 0)) * 100)
  }));

  return (
    <Card className="mt-6 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Razones de Desconexión</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumen por Categorías - CORREGIDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {categoryData.map((category, index) => (
            <div 
              key={index} 
              className="bg-accent p-4 rounded-lg text-center border border-border"
            >
              <div className="text-2xl font-bold text-card-foreground">{category.count}</div>
              <div className="text-sm text-card-foreground capitalize">
                {category.category === 'ended' ? 'Finalizadas' : 
                 category.category === 'not_connected' ? 'No Conectadas' : 'Errores'}
              </div>
              <div className="text-xs text-muted-foreground">{category.percentage}% del total</div>
            </div>
          ))}
        </div>

        {/* Gráfico de categorías - CORREGIDO */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 text-card-foreground">Distribución por Categoría</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                tickFormatter={(value) => 
                  value === 'ended' ? 'Finalizadas' : 
                  value === 'not_connected' ? 'No Conectadas' : 'Errores'
                }
                stroke="hsl(var(--card-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--card-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--card-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--card-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                name="Cantidad de Llamadas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico circular por razones específicas - CORREGIDO */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 text-card-foreground">Razones Específicas</h4>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                nameKey="reason"
                label={({ reason, percentage }) => 
                  `${getFriendlyReasonName(reason)}: ${percentage}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border p-3 rounded-lg shadow-metric">
                        <p className="text-card-foreground font-medium">
                          {getFriendlyReasonName(data.reason)}
                        </p>
                        <p className="text-card-foreground">
                          {data.count} llamadas ({data.percentage}%)
                        </p>
                        <p className="text-muted-foreground text-sm capitalize">
                          {data.category === 'ended' ? 'Finalizada' : 
                           data.category === 'not_connected' ? 'No Conectada' : 'Error'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend formatter={renderColorfulLegendText} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla detallada - CORREGIDA */}
        <div>
          <h4 className="text-lg font-medium mb-4 text-card-foreground">Desglose Detallado</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-card-foreground">Razón</th>
                  <th className="text-right p-2 text-card-foreground">Cantidad</th>
                  <th className="text-right p-2 text-card-foreground">Porcentaje</th>
                  <th className="text-left p-2 text-card-foreground">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-accent">
                    <td className="p-2 text-card-foreground">{getFriendlyReasonName(item.reason)}</td>
                    <td className="text-right p-2 text-card-foreground">{item.count}</td>
                    <td className="text-right p-2 text-card-foreground">{item.percentage}%</td>
                    <td className="p-2 text-card-foreground capitalize">
                      {item.category === 'ended' ? 'Finalizada' : 
                       item.category === 'not_connected' ? 'No Conectada' : 'Error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};