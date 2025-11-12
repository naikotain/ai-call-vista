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

const CATEGORY_COLORS = {
  ended: '#10B981',    // Verde
  not_connected: '#3B82F6', // Azul
  error: '#EF4444'     // Rojo
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
      <Card>
        <CardHeader>
          <CardTitle>Razones de Desconexión</CardTitle>
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Razones de Desconexión</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumen por Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {categoryData.map((category, index) => (
            <div key={index} className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{category.count}</div>
              <div className="text-sm capitalize">
                {category.category === 'ended' ? 'Finalizadas' : 
                 category.category === 'not_connected' ? 'No Conectadas' : 'Errores'}
              </div>
              <div className="text-xs text-muted-foreground">{category.percentage}% del total</div>
            </div>
          ))}
        </div>

        {/* Gráfico de categorías */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Distribución por Categoría</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tickFormatter={(value) => 
                  value === 'ended' ? 'Finalizadas' : 
                  value === 'not_connected' ? 'No Conectadas' : 'Errores'
                } 
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} llamadas`, 'Cantidad']}
                labelFormatter={(value) => 
                  value === 'ended' ? 'Llamadas Finalizadas' : 
                  value === 'not_connected' ? 'Llamadas No Conectadas' : 'Llamadas con Error'
                }
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                name="Cantidad de Llamadas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico circular por razones específicas */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Razones Específicas</h4>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="reason"
                label={({ reason, percentage }) => `${getFriendlyReasonName(reason)}: ${percentage}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} llamadas (${props.payload.percentage}%)`,
                  getFriendlyReasonName(props.payload.reason)
                ]} 
              />
              <Legend formatter={(value) => getFriendlyReasonName(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla detallada */}
        <div>
          <h4 className="text-lg font-medium mb-4">Desglose Detallado</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Razón</th>
                  <th className="text-right p-2">Cantidad</th>
                  <th className="text-right p-2">Porcentaje</th>
                  <th className="text-left p-2">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{getFriendlyReasonName(item.reason)}</td>
                    <td className="text-right p-2">{item.count}</td>
                    <td className="text-right p-2">{item.percentage}%</td>
                    <td className="p-2 capitalize">
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