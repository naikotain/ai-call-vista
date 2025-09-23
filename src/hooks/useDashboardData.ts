import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DisconnectionReason {
  reason: string;
  count: number;
  percentage: number;
  category: 'ended' | 'not_connected' | 'error';
}

export interface DisconnectionMetrics {
  totalCalls: number;
  byCategory: {
    ended: number;
    not_connected: number;
    error: number;
  };
  reasons: DisconnectionReason[];
}

export interface DashboardData {
  pickupRate: number;
  successRate: number;
  transferRate: number;
  voicemailRate: number;
  callVolume: Array<{ name: string; calls: number }>;
  callDuration: Array<{ name: string; duration: number }>;
  latency: Array<{ name: string; latency: number }>;
  inboundOutbound: Array<{ name: string; entrantes: number; salientes: number }>;
  sentiment: Array<{ name: string; value: number; color: string }>;
  agentPerformance: Array<{
    metric: string;
    'Agente 1': number;
    'Agente 2': number;
    'Agente 3': number;
  }>;
  failedMetrics?: {
    totalFailed: number;
    failedInbound: number;
    failedOutbound: number;
    failureRate: number;
    inboundFailureRate: number;
    outboundFailureRate: number;
  };
  costMetrics?: {
    totalCosto: number;
    costoPromedioPorLlamada: number;
    costoPorMinuto: number;
    costoPorTipo: {
      inbound: number;
      outbound: number;
    };
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
  };
  disconnectMetrics?: DisconnectionMetrics;
  // NUEVO: Datos para SuccessByHourChart
  successByHour: Array<{
    hour: string;
    successRate: number;
    totalCalls: number;
    successfulCalls: number;
  }>;
}

// Helper functions para categorizar las razones
const categorizeDisconnectReason = (reason: string): 'ended' | 'not_connected' | 'error' => {
  const endedReasons = ['user_hangup', 'agent_hangup', 'voicemail_reached', 'inactivity', 'max_duration_reached'];
  const notConnectedReasons = ['dial_busy', 'dial_failed', 'dial_no_answer', 'invalid_destination', 
                              'telephony_provider_permission_denied', 'telephony_provider_unavailable',
                              'sip_routing_error', 'marked_as_spam', 'user_declined'];
  
  if (endedReasons.includes(reason)) return 'ended';
  if (notConnectedReasons.includes(reason)) return 'not_connected';
  return 'error';
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
    'registered_call_timeout': 'Timeout de llamada'
  };
  
  return reasonNames[reason] || reason;
};

// Helper function to get week days in Spanish (SIN problemas de timezone)
const getWeekDays = (): { id: number, name: string }[] => {
  return [
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' },
    { id: 0, name: 'Dom' }
  ];
};

// NUEVA FUNCIÓN: Calcular éxito por hora
const calculateSuccessByHour = (calls: any[]): Array<{
  hour: string;
  successRate: number;
  totalCalls: number;
  successfulCalls: number;
}> => {
  // Crear objeto para agrupar por hora
  const hoursData: Record<number, { total: number; successful: number }> = {};
  
  // Inicializar todas las horas (0-23)
  for (let hour = 0; hour < 24; hour++) {
    hoursData[hour] = { total: 0, successful: 0 };
  }
  
  // Procesar cada llamada
  calls.forEach(call => {
    if (!call.started_at) return;
    
    const callHour = new Date(call.started_at).getHours();
    const isSuccessful = call.status === 'completed' || call.status === 'successful';
    
    hoursData[callHour].total += 1;
    if (isSuccessful) {
      hoursData[callHour].successful += 1;
    }
  });
  
  // Convertir a array y calcular tasas
  return Object.entries(hoursData)
    .map(([hour, data]) => {
      const hourNum = parseInt(hour);
      const successRate = data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0;
      
      return {
        hour: `${hourNum.toString().padStart(2, '0')}:00`,
        successRate,
        totalCalls: data.total,
        successfulCalls: data.successful
      };
    })
    .filter(item => item.totalCalls > 0) // Solo mostrar horas con llamadas
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)); // Ordenar por hora
};

// Fetch data from Supabase
async function fetchDataFromSupabase(filters: DashboardFilters): Promise<DashboardData> {
  try {
    let query = supabase
      .from('calls')
      .select('*, agents(name)');

    // Aplicar filtros condicionalmente
    if (filters.agent !== 'all') {
      query = query.eq('agent_id', filters.agent);
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.callType !== 'all') {
      query = query.eq('direction', filters.callType);
    }

    if (filters.channel !== 'all') {
      query = query.eq('channel', filters.channel);
    }

    // Aplicar filtro de rango de tiempo
    if (filters.timeRange !== 'all') {
      const date = new Date();
      let startDate: Date;
      
      switch (filters.timeRange) {
        case 'today':
          startDate = new Date(date.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(date.setDate(date.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(date.setMonth(date.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('started_at', startDate.toISOString());
    }

    // Ejecutar la consulta
    const { data: calls, error: callsError } = await query;

    if (callsError) {
      console.error('Error fetching calls:', callsError);
      throw callsError;
    }

    // Fetch agents for agent performance
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*');

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      throw agentsError;
    }

    // Calculate metrics
    const totalCalls = calls?.length || 0;
    const successfulCalls = calls?.filter(call => call.status === 'completed' || call.status === 'successful').length || 0;
    const transferredCalls = calls?.filter(call => call.status === 'transferred').length || 0;
    const voicemailCalls = calls?.filter(call => call.status === 'voicemail').length || 0;
    const answeredCalls = calls?.filter(call => call.status !== 'missed' && call.status !== 'failed').length || 0;
    const failedCalls = calls?.filter(call => call.status === 'failed').length || 0;
    const inboundCalls = calls?.filter(call => call.direction === 'inbound').length || 0;
    const outboundCalls = calls?.filter(call => call.direction === 'outbound').length || 0;

    // Calculate rates
    const pickupRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    const transferRate = totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0;
    const voicemailRate = totalCalls > 0 ? Math.round((voicemailCalls / totalCalls) * 100) : 0;

    // Get week days for charts (SIN problemas de timezone)
    const weekDays = getWeekDays();
    
    // DEBUG: Verificar datos
    console.log('=== DEBUG DATOS ===');
    console.log('Filtros aplicados:', filters);
    console.log('Total llamadas obtenidas:', calls?.length);
    console.log('Rango de fechas de llamadas:');
    if (calls && calls.length > 0) {
      const dates = calls.map(call => call.started_at).filter(Boolean);
      if (dates.length > 0) {
        console.log('Fecha más antigua:', new Date(Math.min(...dates.map(d => new Date(d).getTime()))));
        console.log('Fecha más reciente:', new Date(Math.max(...dates.map(d => new Date(d).getTime()))));
      }
    }
    
    // 1. Volumen de llamadas por día (SOLUCIÓN ROBUSTA)
    const callVolume = weekDays.map(day => ({
      name: day.name,
      calls: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id;
      }).length || 0
    }));

    // 2. Duración promedio por día (SOLUCIÓN ROBUSTA)
    const callDuration = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at || !call.duration) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const avgDuration = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / dayCalls.length / 60
        : 0;

      return {
        name: day.name,
        duration: Math.round(avgDuration * 10) / 10
      };
    });

    // 3. Latencia promedio por día (SOLUCIÓN ROBUSTA)
    const latency = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at || !call.latency) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const avgLatency = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.latency || 0), 0) / dayCalls.length / 1000
        : 0;

      return {
        name: day.name,
        latency: Math.round(avgLatency * 10) / 10
      };
    });

    // 4. Llamadas entrantes vs salientes por día (SOLUCIÓN ROBUSTA)
    const inboundOutbound = weekDays.map(day => ({
      name: day.name,
      entrantes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.direction === 'inbound';
      }).length || 0,
      salientes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.direction === 'outbound';
      }).length || 0
    }));

    // 5. NUEVO: Tasa de éxito por hora (DATOS REALES)
    const successByHour = calculateSuccessByHour(calls || []);

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: calls?.filter(call => call.sentiment === 'positive').length || 0,
      neutral: calls?.filter(call => call.sentiment === 'neutral').length || 0,
      negative: calls?.filter(call => call.sentiment === 'negative').length || 0
    };

    const sentimentTotal = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    
    const sentiment = [
      {
        name: 'Positivo',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.positive / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--success))'
      },
      {
        name: 'Neutral',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.neutral / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--warning))'
      },
      {
        name: 'Negativo',
        value: sentimentTotal > 0 ? Math.round((sentimentCounts.negative / sentimentTotal) * 100) : 0,
        color: 'hsl(var(--danger))'
      }
    ];

    // Calculate agent performance
    const agentPerformance = agents?.slice(0, 3).reduce((acc, agent, index) => {
      const agentCalls = calls?.filter(call => call.agent_id === agent.id) || [];
      const agentName = `Agente ${index + 1}`;
      
      const agentSuccessRate = agentCalls.length > 0 
        ? Math.round((agentCalls.filter(call => call.status === 'completed' || call.status === 'successful').length / agentCalls.length) * 100)
        : 0;
      
      const agentTransferRate = agentCalls.length > 0
        ? Math.round((agentCalls.filter(call => call.status === 'transferred').length / agentCalls.length) * 100)
        : 0;
      
      const agentAvgDuration = agentCalls.length > 0
        ? Math.round(agentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / agentCalls.length / 60)
        : 0;

      // Mock values for satisfaction and calls per hour
      const satisfaction = Math.floor(Math.random() * 25) + 70;
      const callsPerHour = Math.floor(Math.random() * 20) + 70;

      if (!acc.length) {
        acc = [
          { metric: 'Tasa de éxito', [agentName]: agentSuccessRate },
          { metric: 'Tasa de transferencia', [agentName]: agentTransferRate },
          { metric: 'Duración promedio', [agentName]: agentAvgDuration },
          { metric: 'Satisfacción cliente', [agentName]: satisfaction },
          { metric: 'Llamadas/hora', [agentName]: callsPerHour }
        ];
      } else {
        acc[0][agentName] = agentSuccessRate;
        acc[1][agentName] = agentTransferRate;
        acc[2][agentName] = agentAvgDuration;
        acc[3][agentName] = satisfaction;
        acc[4][agentName] = callsPerHour;
      }

      return acc;
    }, [] as any[]) || [];

    // Métricas para fallos
    const failedMetrics = {
      totalFailed: failedCalls,
      failedInbound: calls?.filter(call => call.status === 'failed' && call.direction === 'inbound').length || 0,
      failedOutbound: calls?.filter(call => call.status === 'failed' && call.direction === 'outbound').length || 0,
      failureRate: totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0,
      inboundFailureRate: inboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.direction === 'inbound').length || 0) / inboundCalls * 100) : 0,
      outboundFailureRate: outboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.direction === 'outbound').length || 0) / outboundCalls * 100) : 0
    };

    // ✅ CALCULAR MÉTRICAS DE COSTO
    const calcularCostoLlamada = (duration: number | null): number => {
      if (!duration) return 0.0016; // Costo base si no hay duración
      // Fórmula: 0.0016 USD + (0.016 USD por minuto)
      return 0.0016 + (duration * 0.016 / 60);
    };

    const totalCosto = calls?.reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0;
    const costoPromedioPorLlamada = totalCalls > 0 ? totalCosto / totalCalls : 0;
    const costoPorMinuto = 0.016; // Tarifa fija por minuto

    // Costo por tipo de llamada
    const costoPorTipo = {
      inbound: calls?.filter(call => call.direction === 'inbound')
                    .reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0,
      outbound: calls?.filter(call => call.direction === 'outbound')
                     .reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0
    };

    // Costo por agente
    const costoPorAgente = agents.map(agent => {
      const agentCalls = calls?.filter(call => call.agent_id === agent.id) || [];
      const costoAgente = agentCalls.reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0);
      return {
        agente: agent.name,
        costo: parseFloat(costoAgente.toFixed(6)),
        llamadas: agentCalls.length,
        costoPromedio: agentCalls.length > 0 ? parseFloat((costoAgente / agentCalls.length).toFixed(6)) : 0
      };
    });

    // Costo por día de la semana
    const costoPorDia = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const costoDia = dayCalls.reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0);
      
      return {
        name: day.name,
        costo: parseFloat(costoDia.toFixed(6))
      };
    });

    // ✅ CALCULAR MÉTRICAS DE DESCONEXIÓN (NUEVO)
    const disconnectReasonCounts: Record<string, number> = {};

    calls?.forEach((call: any) => {
      if (call.disconnect_reason) {
        disconnectReasonCounts[call.disconnect_reason] = (disconnectReasonCounts[call.disconnect_reason] || 0) + 1;
      }
    });

    // También necesitas actualizar otras partes donde uses 'call'
    const totalCallsWithDisconnectReason = Object.values(disconnectReasonCounts).reduce((sum, count) => sum + count, 0);
    // Formatear razones de desconexión
    const disconnectReasons = Object.entries(disconnectReasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCallsWithDisconnectReason > 0 ? Math.round((count / totalCallsWithDisconnectReason) * 100) : 0,
        category: categorizeDisconnectReason(reason)
      }))
      .sort((a, b) => b.count - a.count);

    // Calcular totales por categoría
    const byCategory = disconnectReasons.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    const disconnectMetrics: DisconnectionMetrics = {
      totalCalls: totalCallsWithDisconnectReason,
      byCategory: {
        ended: byCategory.ended || 0,
        not_connected: byCategory.not_connected || 0,
        error: byCategory.error || 0
      },
      reasons: disconnectReasons
    };

    return {
      pickupRate,
      successRate,
      transferRate,
      voicemailRate,
      callVolume,
      callDuration,
      latency,
      inboundOutbound,
      sentiment,
      agentPerformance,
      failedMetrics,
      costMetrics: {
        totalCosto: parseFloat(totalCosto.toFixed(6)),
        costoPromedioPorLlamada: parseFloat(costoPromedioPorLlamada.toFixed(6)),
        costoPorMinuto: parseFloat(costoPorMinuto.toFixed(6)),
        costoPorTipo,
        costoPorAgente,
        costoPorDia
      },
      // ✅ NUEVO: Métricas de desconexión
      disconnectMetrics,
      // ✅ NUEVO: Datos reales para SuccessByHourChart
      successByHour
    };

  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    
    // Return default empty data on error
    const weekDays = getWeekDays();
    const emptyDayData = weekDays.map(day => ({ name: day.name, calls: 0 }));
    
    return {
      pickupRate: 0,
      successRate: 0,
      transferRate: 0,
      voicemailRate: 0,
      callVolume: emptyDayData,
      callDuration: emptyDayData.map(d => ({ name: d.name, duration: 0 })),
      latency: emptyDayData.map(d => ({ name: d.name, latency: 0 })),
      inboundOutbound: emptyDayData.map(d => ({ name: d.name, entrantes: 0, salientes: 0 })),
      sentiment: [
        { name: 'Positivo', value: 0, color: 'hsl(var(--success))' },
        { name: 'Neutral', value: 0, color: 'hsl(var(--warning))' },
        { name: 'Negativo', value: 0, color: 'hsl(var(--danger))' }
      ],
      agentPerformance: [],
      failedMetrics: {
        totalFailed: 0,
        failedInbound: 0,
        failedOutbound: 0,
        failureRate: 0,
        inboundFailureRate: 0,
        outboundFailureRate: 0
      },
      costMetrics: {
        totalCosto: 0,
        costoPromedioPorLlamada: 0,
        costoPorMinuto: 0.016,
        costoPorTipo: {
          inbound: 0,
          outbound: 0
        },
        costoPorAgente: [],
        costoPorDia: weekDays.map(day => ({ name: day.name, costo: 0 }))
      },
      disconnectMetrics: {
        totalCalls: 0,
        byCategory: {
          ended: 0,
          not_connected: 0,
          error: 0
        },
        reasons: []
      },
      // ✅ Datos vacíos para SuccessByHourChart en caso de error
      successByHour: []
    };
  }
}

export interface Agent {
  id: string;
  name: string;
}

export interface DashboardFilters {
  agent: string;
  timeRange: string;
  callType: string;
  status: string;
  channel: string;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    agent: 'all',
    timeRange: 'all',
    callType: 'all',
    status: 'all',
    channel: 'all',
  });

  // Fetch agents list
  const fetchAgents = async () => {
    try {
      const { data: agentsData, error } = await supabase
        .from('agents')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching agents:', error);
        return;
      }
      
      setAgents(agentsData || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const updateData = async (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setLoading(true);
    
    try {
      const newData = await fetchDataFromSupabase(updatedFilters);
      setData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data and agents
  useEffect(() => {
    fetchAgents();
    updateData({});
  }, []);

  return {
    data,
    agents,
    loading,
    filters,
    updateData,
  };
};