import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Call = Database['public']['Tables']['calls']['Row'];

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
  successByHour: Array<{
    hour: string;
    successRate: number;
    totalCalls: number;
    successfulCalls: number;
  }>;
}

// FUNCIÓN PARA CONVERTIR "1m 54s" A SEGUNDOS
const parseDurationToSeconds = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  // Extraer minutos y segundos usando regex
  const minutesMatch = durationStr.match(/(\d+)m/);
  const secondsMatch = durationStr.match(/(\d+)s/);
  
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
  
  return (minutes * 60) + seconds;
};

// Función para manejar diferentes formatos de duración
const parseDuration = (durationStr: string | null): number => {
  if (!durationStr) return 0;
  
  // Si ya es un número (segundos)
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr);
  }
  
  // Formato "1m 54s" (tu caso principal)
  if (durationStr.includes('m') || durationStr.includes('s')) {
    return parseDurationToSeconds(durationStr);
  }
  
  // Formato MM:SS
  if (/^\d+:\d+$/.test(durationStr)) {
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return (minutes * 60) + seconds;
  }
  
  return 0; // Por defecto
};

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

// Helper function to get week days in Spanish
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

// Función para calcular éxito por hora
const calculateSuccessByHour = (calls: Call[]): Array<{
  hour: string;
  successRate: number;
  totalCalls: number;
  successfulCalls: number;
}> => {
  const hoursData: Record<number, { total: number; successful: number }> = {};
  
  for (let hour = 0; hour < 24; hour++) {
    hoursData[hour] = { total: 0, successful: 0 };
  }
  
  calls.forEach(call => {
    if (!call.started_at) return;
    
    const callHour = new Date(call.started_at).getHours();
    const isSuccessful = call.status === 'completed' || call.status === 'successful';
    
    hoursData[callHour].total += 1;
    if (isSuccessful) {
      hoursData[callHour].successful += 1;
    }
  });
  
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
    .filter(item => item.totalCalls > 0)
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
};

// Fetch data from Supabase
async function fetchDataFromSupabase(filters: DashboardFilters): Promise<DashboardData> {
  try {
    let query = supabase
      .from('calls')
      .select('*, agents(name)');

    // Aplicar filtros condicionalmente
    if (filters.agent !== 'all') {
      query = query.eq('api', filters.agent);
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.callType !== 'all') {
      query = query.eq('tipo_de_llamada', filters.callType);
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
    const inboundCalls = calls?.filter(call => call.tipo_de_llamada === 'inbound').length || 0;
    const outboundCalls = calls?.filter(call => call.tipo_de_llamada === 'outbound').length || 0;

    // Calculate rates
    const pickupRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    const transferRate = totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0;
    const voicemailRate = totalCalls > 0 ? Math.round((voicemailCalls / totalCalls) * 100) : 0;

    // Get week days for charts
    const weekDays = getWeekDays();
    
    // 1. Volumen de llamadas por día
    const callVolume = weekDays.map(day => ({
      name: day.name,
      calls: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id;
      }).length || 0
    }));

    // 2. Duración promedio por día (EN MINUTOS) - ACTUALIZADO
    const callDuration = weekDays.map(day => {
      const dayCalls = calls?.filter(call => {
        if (!call.started_at || !call.duration) return false;
        return new Date(call.started_at).getDay() === day.id;
      }) || [];

      const totalMinutes = dayCalls.reduce((sum, call) => {
        const seconds = parseDuration(call.duration);
        return sum + (seconds / 60); // Convertir a minutos directamente
      }, 0);

      const avgDurationMinutes = dayCalls.length > 0 
        ? totalMinutes / dayCalls.length
        : 0;

      return {
        name: day.name,
        duration: Math.round(avgDurationMinutes * 10) / 10 // Minutos con 1 decimal
      };
    });

    // 3. Latencia promedio por día
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

    // 4. Llamadas entrantes vs salientes por día
    const inboundOutbound = weekDays.map(day => ({
      name: day.name,
      entrantes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.tipo_de_llamada === 'inbound';
      }).length || 0,
      salientes: calls?.filter(call => {
        if (!call.started_at) return false;
        return new Date(call.started_at).getDay() === day.id && call.tipo_de_llamada === 'outbound';
      }).length || 0
    }));

    // 5. Tasa de éxito por hora
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

    // Calculate agent performance - ACTUALIZADO para usar parseDuration
    const agentPerformance = agents?.slice(0, 3).reduce((acc, agent, index) => {
      const agentCalls = calls?.filter(call => call.api === agent.id) || [];
      const agentName = `Agente ${index + 1}`;
      
      const agentSuccessRate = agentCalls.length > 0 
        ? Math.round((agentCalls.filter(call => call.status === 'completed' || call.status === 'successful').length / agentCalls.length) * 100)
        : 0;
      
      const agentTransferRate = agentCalls.length > 0
        ? Math.round((agentCalls.filter(call => call.status === 'transferred').length / agentCalls.length) * 100)
        : 0;
      
      // Duración promedio en minutos - ACTUALIZADO
      const agentAvgDurationMinutes = agentCalls.length > 0
        ? agentCalls.reduce((sum, call) => sum + (parseDuration(call.duration) / 60), 0) / agentCalls.length
        : 0;

      const satisfaction = Math.floor(Math.random() * 25) + 70;
      const callsPerHour = Math.floor(Math.random() * 20) + 70;

      if (!acc.length) {
        acc = [
          { metric: 'Tasa de éxito', [agentName]: agentSuccessRate },
          { metric: 'Tasa de transferencia', [agentName]: agentTransferRate },
          { metric: 'Duración promedio (min)', [agentName]: Math.round(agentAvgDurationMinutes * 10) / 10 },
          { metric: 'Satisfacción cliente', [agentName]: satisfaction },
          { metric: 'Llamadas/hora', [agentName]: callsPerHour }
        ];
      } else {
        acc[0][agentName] = agentSuccessRate;
        acc[1][agentName] = agentTransferRate;
        acc[2][agentName] = Math.round(agentAvgDurationMinutes * 10) / 10;
        acc[3][agentName] = satisfaction;
        acc[4][agentName] = callsPerHour;
      }

      return acc;
    }, [] as any[]) || [];

    // Métricas para fallos
    const failedMetrics = {
      totalFailed: failedCalls,
      failedInbound: calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'inbound').length || 0,
      failedOutbound: calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'outbound').length || 0,
      failureRate: totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0,
      inboundFailureRate: inboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'inbound').length || 0) / inboundCalls * 100) : 0,
      outboundFailureRate: outboundCalls > 0 ? Math.round((calls?.filter(call => call.status === 'failed' && call.tipo_de_llamada === 'outbound').length || 0) / outboundCalls * 100) : 0
    };

    // ✅ CALCULAR MÉTRICAS DE COSTO - ACTUALIZADO
    const calcularCostoLlamada = (durationStr: string | null): number => {
      const durationSeconds = parseDuration(durationStr);
      const durationMinutes = durationSeconds / 60;
      return 0.0016 + (durationMinutes * 0.016);
    };

    const totalCosto = calls?.reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0;
    const costoPromedioPorLlamada = totalCalls > 0 ? totalCosto / totalCalls : 0;
    const costoPorMinuto = 0.016;

    // Costo por tipo de llamada
    const costoPorTipo = {
      inbound: calls?.filter(call => call.tipo_de_llamada === 'inbound')
                    .reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0,
      outbound: calls?.filter(call => call.tipo_de_llamada === 'outbound')
                     .reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0) || 0
    };

    // Costo por agente - ACTUALIZADO
    const costoPorAgente = agents.map(agent => {
      const agentCalls = calls?.filter(call => call.api === agent.id) || [];
      const costoAgente = agentCalls.reduce((sum, call) => sum + calcularCostoLlamada(call.duration), 0);
      return {
        agente: agent.name,
        costo: parseFloat(costoAgente.toFixed(6)),
        llamadas: agentCalls.length,
        costoPromedio: agentCalls.length > 0 ? parseFloat((costoAgente / agentCalls.length).toFixed(6)) : 0
      };
    });

    // Costo por día de la semana - ACTUALIZADO
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

    // ✅ CALCULAR MÉTRICAS DE DESCONEXIÓN
    const disconnectReasonCounts: Record<string, number> = {};

    calls?.forEach((call: any) => {
      if (call.disconnect_reason) {
        disconnectReasonCounts[call.disconnect_reason] = (disconnectReasonCounts[call.disconnect_reason] || 0) + 1;
      }
    });

    const totalCallsWithDisconnectReason = Object.values(disconnectReasonCounts).reduce((sum, count) => sum + count, 0);
    
    const disconnectReasons = Object.entries(disconnectReasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCallsWithDisconnectReason > 0 ? Math.round((count / totalCallsWithDisconnectReason) * 100) : 0,
        category: categorizeDisconnectReason(reason)
      }))
      .sort((a, b) => b.count - a.count);

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
      disconnectMetrics,
      successByHour
    };

  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    
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