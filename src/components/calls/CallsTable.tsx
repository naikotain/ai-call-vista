// components/calls/CallsTable.tsx
'use client';

import { DashboardFilters } from '@/hooks/useDashboardData';
import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ✅ IMPORTAR funciones del sistema de costos multi-tenant
import { calculateCallCost, getCurrentClientId } from '@/config/countryCosts';

type Call = Database['public']['Tables']['calls']['Row'] & {
  agents?: { name: string } | null;
} & {
  country_code?: string;
  retell_cost?: number;
  costo?: number;
  country_name?: string;
};

interface CallsTableProps {
  filters?: DashboardFilters;
}

export const CallsTable = ({ filters }: CallsTableProps) => {
  const supabase = useSupabase();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // ✅ Obtener clientId actual
  const clientId = getCurrentClientId();

  useEffect(() => {
    fetchCalls();
  }, [filters]);

  const fetchCalls = async () => {
    console.log('🚀 CallsTable - Starting fetch with filters:', filters);
    try {
      setLoading(true);
      
      let query = supabase
        .from('calls')
        .select(`*, agents:api (name)`);

      // ✅ APLICAR FILTROS SI EXISTEN
      if (filters) {
        console.log('🔍 CallsTable - Aplicando filtros:', filters);
        
        if (filters.agent !== 'all') {
          query = query.eq('api', filters.agent);
        }
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.callType !== 'all') {
          query = query.eq('tipo_de_llamada', filters.callType);
        }
        if (filters.country !== 'all') {
          query = query.eq('country_code', filters.country.toLowerCase());
        }
        if (filters.channel !== 'all') {
          query = query.eq('channel', filters.channel);
        }
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
      }

      query = query.order('started_at', { ascending: false });

      const { data: callsData, error } = await query;

      if (error) throw error;
      
      console.log('✅ CallsTable - Llamadas encontradas:', callsData?.length);
      setCalls(callsData || []);
      
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear la duración
  const formatDuration = (duration: string | null) => {
    if (!duration) return 'N/A';
    return duration; // Ya está en formato "1m 30s"
  };

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ FUNCIÓN PARA CALCULAR COSTOS USANDO SISTEMA MULTI-TENANT
  const calcularCostosParaTabla = (call: Call) => {
    const retellCost = call.retell_cost || 0;
    const costoTotal = calculateCallCost(
      retellCost, 
      call.duration || '', 
      call.country_code || 'CL',
      clientId
    );
    const costoLlamada = costoTotal - retellCost;
    
    return {
      retellCost: retellCost,
      costoLlamada: costoLlamada,
      costoTotal: costoTotal
    };
  };

  // Filtrar llamadas
  const filteredCalls = calls.filter(call => {
    const matchesSearch = searchTerm === '' || 
      call.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.agents?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesType = typeFilter === 'all' || call.tipo_de_llamada === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Badge de estado con colores
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      successful: { label: 'Exitoso', variant: 'default' as const },
      failed: { label: 'Fallido', variant: 'destructive' as const },
      transferred: { label: 'Transferido', variant: 'secondary' as const },
      voicemail: { label: 'Buzón', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Badge de tipo de llamada
  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'inbound' ? 'default' : 'secondary'}>
        {type === 'inbound' ? 'Entrante' : 'Saliente'}
      </Badge>
    );
  };

  // ✅ DEBUG para verificar cálculos
  useEffect(() => {
    if (filteredCalls.length > 0) {
      console.log('🔍 CALLSTABLE DEBUG - Cliente actual:', clientId);
      const primeraConCosto = filteredCalls.find(call => call.retell_cost > 0);
      if (primeraConCosto) {
        const costos = calcularCostosParaTabla(primeraConCosto);
        console.log('🔍 CALLSTABLE DEBUG - Ejemplo cálculo:', {
          clientId,
          retell_cost: primeraConCosto.retell_cost,
          duration: primeraConCosto.duration,
          country_code: primeraConCosto.country_code,
          costoLlamada: costos.costoLlamada,
          costoTotal: costos.costoTotal
        });
      }
    }
  }, [filteredCalls, clientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando llamadas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por teléfono o agente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="successful">Exitoso</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="transferred">Transferido</SelectItem>
                <SelectItem value="voicemail">Buzón de voz</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="inbound">Entrantes</SelectItem>
                <SelectItem value="outbound">Salientes</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchCalls} variant="outline">
              🔄 Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Registros de Llamadas ({filteredCalls.length})</span>
            <Badge variant="outline">
              Total: {calls.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Sentimiento</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Costo Retell</TableHead>
                  <TableHead>Costo Llamada</TableHead>
                  <TableHead>Costo Total</TableHead> 
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No se encontraron llamadas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalls.map((call) => {
                    // ✅ CALCULAR COSTOS USANDO SISTEMA MULTI-TENANT
                    const costos = calcularCostosParaTabla(call);
                    
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {formatDate(call.started_at)}
                        </TableCell>
                        <TableCell>
                          {call.agents?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{call.customer_phone}</TableCell>
                        <TableCell>{getTypeBadge(call.tipo_de_llamada)}</TableCell>
                        <TableCell>{getStatusBadge(call.status)}</TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {call.channel || 'Voz'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.sentiment ? (
                            <Badge variant={
                              call.sentiment === 'positive' ? 'default' :
                              call.sentiment === 'negative' ? 'destructive' : 'outline'
                            }>
                              {call.sentiment === 'positive' ? 'Positivo' :
                              call.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {call.country_code ? (
                            <Badge variant="outline">
                              {call.country_code === 'CL' ? '🇨🇱 Chile' :
                              call.country_code === 'AR' ? '🇦🇷 Argentina' :
                              call.country_code === 'MX' ? '🇲🇽 México' :
                              call.country_code === 'ES' ? '🇪🇸 España' :
                              call.country_code}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        {/* ✅ COLUMNAS DE COSTO CON SISTEMA MULTI-TENANT */}
                        <TableCell className="text-right">
                          ${costos.retellCost.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${costos.costoLlamada.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${costos.costoTotal.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};