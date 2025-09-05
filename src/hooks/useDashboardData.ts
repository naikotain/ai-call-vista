import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export interface CallEvent {
  id: string;
  call_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export interface CallFinalState {
  call_id: string;
  status: string;
  agent_id?: string;
  duration?: number;
  direction?: string;
  channel?: string;
  sentiment?: string;
  started_at: string;
  ended_at?: string;
  latency?: number;
}

// Helper function to get day names in Spanish
const getDayName = (date: Date): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

// Helper function to get date range for the last 7 days
const getLast7Days = (): Date[] => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
};

// Function to reconstruct final call state from events
const reconstructCallState = (events: CallEvent[]): CallFinalState => {
  if (!events.length) {
    throw new Error('No events provided');
  }

  // Sort events by timestamp
  const sortedEvents = events.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const callId = events[0].call_id;
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];

  // Initialize state
  let finalState: CallFinalState = {
    call_id: callId,
    status: 'failed', // default status
    started_at: firstEvent.created_at,
  };

  // Extract basic info from first event
  if (firstEvent.event_data) {
    finalState.agent_id = firstEvent.event_data.agent_id;
    finalState.direction = firstEvent.event_data.direction || 'inbound';
    finalState.channel = firstEvent.event_data.channel || 'phone';
  }

  // Analyze event sequence to determine final status
  const eventTypes = sortedEvents.map(e => e.event_type);
  let wasAnswered = false;
  let wasTransferred = false;
  let voicemailDetected = false;

  for (const event of sortedEvents) {
    switch (event.event_type) {
      case 'call_answered':
        wasAnswered = true;
        break;
      case 'call_transfer_initiated':
      case 'transfer_initiated':
        wasTransferred = true;
        break;
      case 'voicemail_detected':
        voicemailDetected = true;
        break;
      case 'call_ended':
        finalState.ended_at = event.created_at;
        if (event.event_data) {
          finalState.duration = event.event_data.duration;
          finalState.sentiment = event.event_data.sentiment;
        }
        break;
    }

    // Extract additional data from events
    if (event.event_data) {
      if (event.event_data.agent_id && !finalState.agent_id) {
        finalState.agent_id = event.event_data.agent_id;
      }
      if (event.event_data.latency) {
        finalState.latency = event.event_data.latency;
      }
    }
  }

  // Determine final status based on event sequence
  if (voicemailDetected) {
    finalState.status = 'voicemail';
  } else if (wasTransferred) {
    finalState.status = 'transferred';
  } else if (wasAnswered) {
    finalState.status = 'successful';
  } else {
    finalState.status = 'failed';
  }

  return finalState;
};

// Fetch data from Supabase using call_events
async function fetchDataFromSupabase(agentFilter: string): Promise<DashboardData> {
  try {
    // Fetch all call events
    let eventsQuery = supabase.from('call_events').select(`
      id,
      call_id,
      event_type,
      event_data,
      created_at
    `).order('created_at', { ascending: true });

    const { data: events, error: eventsError } = await eventsQuery;
    
    if (eventsError) {
      console.error('Error fetching call events:', eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      console.log('No events found');
      return getDefaultEmptyData();
    }

    // Group events by call_id
    const eventsByCall = events.reduce((acc, event) => {
      if (!acc[event.call_id]) {
        acc[event.call_id] = [];
      }
      acc[event.call_id].push(event);
      return acc;
    }, {} as Record<string, CallEvent[]>);

    // Reconstruct final state for each call
    const callStates: CallFinalState[] = [];
    for (const [callId, callEvents] of Object.entries(eventsByCall)) {
      try {
        const finalState = reconstructCallState(callEvents);
        callStates.push(finalState);
      } catch (error) {
        console.warn(`Failed to reconstruct state for call ${callId}:`, error);
      }
    }

    // Apply agent filter
    let filteredCalls = callStates;
    if (agentFilter !== 'all') {
      filteredCalls = callStates.filter(call => call.agent_id === agentFilter);
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
    const totalCalls = filteredCalls.length;
    const answeredCalls = filteredCalls.filter(call => 
      call.status === 'successful' || call.status === 'transferred'
    ).length;
    const successfulCalls = filteredCalls.filter(call => call.status === 'successful').length;
    const transferredCalls = filteredCalls.filter(call => call.status === 'transferred').length;
    const voicemailCalls = filteredCalls.filter(call => call.status === 'voicemail').length;

    // Calculate rates
    const pickupRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
    const transferRate = totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0;
    const voicemailRate = totalCalls > 0 ? Math.round((voicemailCalls / totalCalls) * 100) : 0;

    // Get last 7 days for charts
    const last7Days = getLast7Days();
    
    // Group calls by day for volume chart
    const callVolume = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = new Date(call.started_at);
        return callDate >= dayStart && callDate <= dayEnd;
      }).length;

      return {
        name: getDayName(date),
        calls: dayCalls
      };
    });

    // Calculate average duration by day
    const callDuration = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = new Date(call.started_at);
        return callDate >= dayStart && callDate <= dayEnd && call.duration;
      });

      const avgDuration = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / dayCalls.length / 60 // Convert to minutes
        : 0;

      return {
        name: getDayName(date),
        duration: Math.round(avgDuration * 10) / 10 // Round to 1 decimal
      };
    });

    // Calculate average latency by day
    const latency = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = new Date(call.started_at);
        return callDate >= dayStart && callDate <= dayEnd && call.latency;
      });

      const avgLatency = dayCalls.length > 0 
        ? dayCalls.reduce((sum, call) => sum + (call.latency || 0), 0) / dayCalls.length / 1000 // Convert to seconds
        : 0;

      return {
        name: getDayName(date),
        latency: Math.round(avgLatency * 10) / 10 // Round to 1 decimal
      };
    });

    // Calculate inbound vs outbound by day
    const inboundOutbound = last7Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = new Date(call.started_at);
        return callDate >= dayStart && callDate <= dayEnd;
      });

      const inbound = dayCalls.filter(call => call.direction === 'inbound').length;
      const outbound = dayCalls.filter(call => call.direction === 'outbound').length;

      return {
        name: getDayName(date),
        entrantes: inbound,
        salientes: outbound
      };
    });

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: filteredCalls.filter(call => call.sentiment === 'positive').length,
      neutral: filteredCalls.filter(call => call.sentiment === 'neutral').length,
      negative: filteredCalls.filter(call => call.sentiment === 'negative').length
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

    // Calculate agent performance (if showing all agents)
    const agentPerformance = agents?.slice(0, 3).reduce((acc, agent, index) => {
      const agentCalls = filteredCalls.filter(call => call.agent_id === agent.id);
      const agentName = `Agente ${index + 1}`;
      
      const agentSuccessRate = agentCalls.length > 0 
        ? Math.round((agentCalls.filter(call => call.status === 'successful').length / agentCalls.length) * 100)
        : 0;
      
      const agentTransferRate = agentCalls.length > 0
        ? Math.round((agentCalls.filter(call => call.status === 'transferred').length / agentCalls.length) * 100)
        : 0;
      
      const agentAvgDuration = agentCalls.length > 0
        ? Math.round(agentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / agentCalls.length / 60)
        : 0;

      // Mock values for satisfaction and calls per hour (would need additional data)
      const satisfaction = Math.floor(Math.random() * 25) + 70; // 70-95
      const callsPerHour = Math.floor(Math.random() * 20) + 70; // 70-90

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
      agentPerformance
    };

  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return getDefaultEmptyData();
  }
}

// Helper function to get default empty data
function getDefaultEmptyData(): DashboardData {
  const last7Days = getLast7Days();
  const emptyDayData = last7Days.map(date => ({ name: getDayName(date), calls: 0 }));
  
  return {
    pickupRate: 0,
    successRate: 0,
    transferRate: 0,
    voicemailRate: 0,
    callVolume: emptyDayData.map(d => ({ name: d.name, calls: 0 })),
    callDuration: emptyDayData.map(d => ({ name: d.name, duration: 0 })),
    latency: emptyDayData.map(d => ({ name: d.name, latency: 0 })),
    inboundOutbound: emptyDayData.map(d => ({ name: d.name, entrantes: 0, salientes: 0 })),
    sentiment: [
      { name: 'Positivo', value: 0, color: 'hsl(var(--success))' },
      { name: 'Neutral', value: 0, color: 'hsl(var(--warning))' },
      { name: 'Negativo', value: 0, color: 'hsl(var(--danger))' }
    ],
    agentPerformance: []
  };
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
    timeRange: 'month',
    callType: 'all',
    status: 'all',
    channel: 'all',
  });

  // Fetch agents list
  const fetchAgents = useCallback(async () => {
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
  }, []);

  // Fetch dashboard data
  const fetchData = useCallback(async (currentFilters: DashboardFilters) => {
    setLoading(true);
    
    try {
      const newData = await fetchDataFromSupabase(currentFilters.agent);
      setData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateData = useCallback(async (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await fetchData(updatedFilters);
  }, [filters, fetchData]);

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(filters);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchData, filters]);

  // Load initial data and agents
  useEffect(() => {
    fetchAgents();
    fetchData(filters);
  }, []); // Only run on mount

  return {
    data,
    agents,
    loading,
    filters,
    updateData,
  };
};