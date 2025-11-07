import React, { useState, useEffect } from 'react';
import { OSDOPClientData } from '../../types/additional-data';
import { OSDOPDataService } from '../../services/osdop-data-service';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '../../config/clients';

// ✅ NUEVO IMPORT: Hook de dashboard para datos relacionados
import { useDashboardData } from '../../hooks/useDashboardData';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Hook para obtener el clientId
const useClientId = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientFromUrl = urlParams.get('client');
  return clientFromUrl || DEFAULT_CLIENT;
};

export const OSDOPDataTable: React.FC = () => {
  const clientId = useClientId();
  
  const [data, setData] = useState<OSDOPClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'classic' | 'related'>('classic'); // ✅ NUEVO: Modo de vista

  // ✅ NUEVO: Usar hook de dashboard para datos relacionados
  const { 
    additionalDataWithCalls, 
    fetchAdditionalDataWithCalls,
    relationshipStats,
    loading: dashboardLoading 
  } = useDashboardData();

  useEffect(() => {
    console.log('🔗 Cargando datos para cliente:', clientId);
    if (clientId && CLIENT_CONFIGS[clientId]) {
      loadData();
    }
  }, [clientId]);

  // ✅ NUEVO: Cargar datos relacionados cuando cambie el modo
  useEffect(() => {
  console.log('🔄 OSDOPDataTable - Cambio de viewMode:', viewMode);
  if (viewMode === 'related') {
    console.log('📞 Ejecutando fetchAdditionalDataWithCalls...');
    fetchAdditionalDataWithCalls();
  }
}, [viewMode, fetchAdditionalDataWithCalls]);

  const loadData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const result = await OSDOPDataService.getOSDOPData(clientId, {});
      console.log('✅ Datos cargados:', result);
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeVariant = (estado: string = '') => {
    if (estado?.includes('Completado') || estado?.includes('completado')) return 'default';
    if (estado?.includes('Pendiente') || estado?.includes('pendiente')) return 'secondary';
    if (estado?.includes('En proceso') || estado?.includes('proceso')) return 'outline';
    if (estado?.includes('Error') || estado?.includes('error')) return 'destructive';
    return 'default';
  };

  // ✅ NUEVA FUNCIÓN: Obtener variante de badge para estado de llamada
  const getCallStatusBadgeVariant = (status: string = '') => {
    if (status === 'successful') return 'default';
    if (status === 'failed') return 'destructive';
    if (status === 'voicemail') return 'secondary';
    if (status === 'transferred') return 'outline';
    if (status === 'ongoing') return 'default';
    return 'secondary';
  };

  // ✅ NUEVA FUNCIÓN: Formatear duración de llamada
  const formatCallDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // ✅ NUEVA FUNCIÓN: Renderizar información de llamada relacionada
  const renderCallInfo = (callData: any) => {
    if (!callData) {
      return (
        <div className="text-xs text-muted-foreground">
          ❌ Sin llamada relacionada
        </div>
      );
    }

    return (
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-1">
          <Badge variant={getCallStatusBadgeVariant(callData.status)} className="text-xs">
            {callData.status || 'N/A'}
          </Badge>
        </div>
        <div>📅 {new Date(callData.started_at).toLocaleDateString('es-ES')}</div>
        <div>⏱️ {formatCallDuration(callData.duration)}</div>
        <div>📞 {callData.customer_phone || 'N/A'}</div>
        {callData.sentiment && (
          <div>🎯 {callData.sentiment}</div>
        )}
      </div>
    );
  };

  // ✅ NUEVO: Estadísticas de relación
  const renderRelationshipStats = () => {
    if (!relationshipStats) return null;

    return (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
        <h4 className="font-semibold text-sm mb-2">📊 Estadísticas de Relación</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="font-medium">Total Llamadas</div>
            <div>{relationshipStats.totalCalls}</div>
          </div>
          <div>
            <div className="font-medium">Total Datos</div>
            <div>{relationshipStats.totalAdditional}</div>
          </div>
          <div>
            <div className="font-medium">Relaciones</div>
            <div>{relationshipStats.matchedRelations}</div>
          </div>
          <div>
            <div className="font-medium">Tasa de Match</div>
            <div>{relationshipStats.matchRate?.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = loading || (viewMode === 'related' && dashboardLoading);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Datos de Consultas y Trámites</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {viewMode === 'classic' 
                ? `Información completa de consultas - ${data.length} registros`
                : `Datos relacionados con llamadas - ${additionalDataWithCalls.length} registros`
              }
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Cliente: {clientId}
              </span>
            </div>
            
            {/* ✅ NUEVO: Selector de modo de vista */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Vista:</span>
              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'classic' | 'related')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="classic">Clásica</option>
                <option value="related">Con Llamadas</option>
              </select>
            </div>
          </div>
        </CardDescription>
        
        <div className="flex space-x-2">
          <Button 
            onClick={viewMode === 'classic' ? loadData : fetchAdditionalDataWithCalls} 
            variant="outline" 
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Actualizar Datos'}
          </Button>
          
          {/* ✅ NUEVO: Botón para ver estadísticas de relación */}
          {viewMode === 'related' && relationshipStats && (
            <Button 
              onClick={fetchAdditionalDataWithCalls}
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              🔄 Actualizar Relación
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* ✅ NUEVO: Mostrar estadísticas de relación en modo relacionado */}
        {viewMode === 'related' && renderRelationshipStats()}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              {viewMode === 'related' ? 'Cargando datos relacionados...' : 'Cargando datos...'}
            </p>
          </div>
        ) : viewMode === 'classic' ? (
          // ✅ VISTA CLÁSICA ORIGINAL (sin cambios)
          data.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>N° Afiliado</TableHead>
                      <TableHead>Motivo Consulta</TableHead>
                      <TableHead>Tipo Trámite</TableHead>
                      <TableHead>Localidad</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleTimeString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <div className="font-medium">{item.nombre || 'N/A'}</div>
                            {item.segundo_nombre && (
                              <div className="text-sm text-muted-foreground">
                                {item.segundo_nombre}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.telefono || 'N/A'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.numero_afiliado || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="line-clamp-2">
                            {item.motivo_consulta || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.tipo_tramite || 'N/A'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.localidad || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(item.estado_tramite)}>
                            {item.estado_tramite || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground text-center">
                  Mostrando {data.length} registros de la tabla additional_client_data
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No hay datos en la tabla
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                La tabla 'additional_client_data' está vacía para el cliente {clientId}
              </div>
              <Button onClick={loadData} variant="outline">
                Reintentar
              </Button>
            </div>
          )
        ) : (
          // ✅ NUEVA VISTA: DATOS RELACIONADOS CON LLAMADAS
          additionalDataWithCalls.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Motivo Consulta</TableHead>
                      <TableHead>Tipo Trámite</TableHead>
                      <TableHead>Estado Trámite</TableHead>
                      <TableHead>Llamada Relacionada</TableHead>
                      <TableHead>Estado Llamada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {additionalDataWithCalls.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleTimeString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <div className="font-medium">{item.nombre || 'N/A'}</div>
                            {item.segundo_nombre && (
                              <div className="text-sm text-muted-foreground">
                                {item.segundo_nombre}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.telefono || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="line-clamp-2">
                            {item.motivo_consulta || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.tipo_tramite || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(item.estado_tramite)}>
                            {item.estado_tramite || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {renderCallInfo(item.call_data)}
                        </TableCell>
                        <TableCell>
                          {item.call_data ? (
                            <Badge variant={getCallStatusBadgeVariant(item.call_data.status)}>
                              {item.call_data.status || 'N/A'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">❌ Sin relación</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground text-center">
                  {additionalDataWithCalls.filter(item => item.call_data).length} / {additionalDataWithCalls.length} registros tienen llamada relacionada
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No hay datos relacionados
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                No se encontraron datos en additional_client_data para el cliente {clientId}
              </div>
              <Button onClick={fetchAdditionalDataWithCalls} variant="outline">
                Reintentar
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};