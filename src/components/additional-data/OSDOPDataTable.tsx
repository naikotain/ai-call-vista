import React, { useState, useEffect } from 'react';
import { OSDOPClientData } from '../../types/normalized';
import { OSDOPDataService } from '../../services/osdop-data-service';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '../../config/clients';

// ✅ NUEVO IMPORT: Configuración dinámica
import { getAdditionalDataConfig } from '../../config/additional-data-config';

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

// ✅ NUEVA FUNCIÓN: Obtener valor de campo (soporta custom_fields)
const getFieldValue = (item: any, key: string) => {
  // Soporte mejorado para campos anidados en custom_fields
  if (key.startsWith('custom_fields.')) {
    const fieldPath = key.replace('custom_fields.', '');
    // Soporte para campos anidados como custom_fields.precio_interesa
    const value = fieldPath.split('.').reduce((obj, prop) => obj?.[prop], item.custom_fields);
    return value || '-';
  }
  return item[key] || '-';
};

// ✅ NUEVA FUNCIÓN: Formatear valor según configuración
const formatFieldValue = (value: any, clientConfig: any, fieldKey: string) => {
  const fieldConfig = clientConfig.fieldConfig?.[fieldKey];
  
  // Formato de moneda para precios
  if (fieldConfig?.type === 'currency') {
    const numericValue = parseFloat(value?.toString().replace(/[^\d.,]/g, '')?.replace(',', '.') || '0');
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: fieldConfig.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  }
  
  // Formato de número
  if (fieldConfig?.type === 'number') {
    return value?.toString() || '0';
  }
  
  // Badges para SI/NO
  if (fieldConfig?.type === 'badge') {
    const variant = fieldConfig.variants?.[value] || 'default';
    return <Badge variant={variant as any}>{value}</Badge>;
  }
  
  // Fecha
  if (fieldConfig?.type === 'date' && value) {
    try {
      return new Date(value).toLocaleDateString('es-ES');
    } catch {
      return value;
    }
  }
  
  return value;
};

export const OSDOPDataTable: React.FC = () => {
  const clientId = useClientId();
  
  const [data, setData] = useState<OSDOPClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'classic' | 'related'>('classic');

  // ✅ NUEVO: Obtener configuración del cliente
  const clientConfig = getAdditionalDataConfig(clientId);
  
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
    <div className="mb-4 p-4 bg-card border border-border rounded-lg text-foreground">
      <h4 className="font-semibold text-lg mb-3">📊 Estadísticas de Relación</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Llamadas */}
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-success">{relationshipStats.totalCalls}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Llamadas</div>
        </div>
        
        {/* Total Datos */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{relationshipStats.totalAdditional}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Datos</div>
        </div>
        
        {/* Relaciones */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-500">{relationshipStats.matchedRelations}</div>
          <div className="text-sm text-muted-foreground mt-1">Relaciones</div>
        </div>
        
        {/* Tasa de Match */}
        <div className={`rounded-lg p-3 text-center ${
          relationshipStats.matchRate >= 90 
            ? 'bg-green-500/10 border border-green-500/20' 
            : relationshipStats.matchRate >= 70
            ? 'bg-yellow-500/10 border border-yellow-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <div className={`text-2xl font-bold ${
            relationshipStats.matchRate >= 90 
              ? 'text-green-500' 
              : relationshipStats.matchRate >= 70
              ? 'text-yellow-500'
              : 'text-red-500'
          }`}>
            {relationshipStats.matchRate?.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Tasa de Match</div>
        </div>
      </div>
    </div>
  );
};

  const isLoading = loading || (viewMode === 'related' && dashboardLoading);

  return (
    <Card className="w-full">
      <CardHeader>
        {/* ✅ CAMBIADO: Título dinámico por cliente */}
        <CardTitle>{clientConfig.tableTitle}</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {viewMode === 'classic' 
                ? `Catálogo de propiedades - ${data.length} registros`
                : `Propiedades con llamadas relacionadas - ${additionalDataWithCalls.length} registros`
              }
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Cliente: {clientId}
              </span>
            </div>
            
            {/* ✅ Selector de modo de vista */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Vista:</span>
              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'classic' | 'related')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="classic">Catálogo</option>
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
          
          {/* ✅ Botón para ver estadísticas de relación */}
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
        {/* ✅ Mostrar estadísticas de relación en modo relacionado */}
        {viewMode === 'related' && renderRelationshipStats()}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              {viewMode === 'related' ? 'Cargando datos relacionados...' : 'Cargando catálogo...'}
            </p>
          </div>
        ) : viewMode === 'classic' ? (
          // ✅ VISTA CLÁSICA CON COLUMNAS DINÁMICAS
          data.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* ✅ COLUMNAS DINÁMICAS POR CLIENTE */}
                      {clientConfig.columns.map(column => (
                        <TableHead key={column.key} className="whitespace-nowrap">
                          {column.displayName}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        {clientConfig.columns.map(column => (
                          <TableCell key={column.key} className="whitespace-nowrap">
                            {/* ✅ RENDERIZADO DINÁMICO CON FORMATO ESPECÍFICO */}
                            {formatFieldValue(
                              getFieldValue(item, column.key), 
                              clientConfig, 
                              column.key
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground text-center">
                  Mostrando {data.length} en el catálogo
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No hay nada en el catálogo
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
          // ✅ VISTA RELACIONADA CON LLAMADAS (también con columnas dinámicas)
          additionalDataWithCalls.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* ✅ COLUMNAS DINÁMICAS + LLAMADA RELACIONADA */}
                      {clientConfig.columns.slice(0, 6).map(column => (
                        <TableHead key={column.key} className="whitespace-nowrap">
                          {column.displayName}
                        </TableHead>
                      ))}
                      <TableHead>Llamada Relacionada</TableHead>
                      <TableHead>Estado Llamada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {additionalDataWithCalls.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        {clientConfig.columns.slice(0, 6).map(column => (
                          <TableCell key={column.key} className="whitespace-nowrap">
                            {formatFieldValue(
                              getFieldValue(item, column.key), 
                              clientConfig, 
                              column.key
                            )}
                          </TableCell>
                        ))}
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
                  {additionalDataWithCalls.filter(item => item.call_data).length} / {additionalDataWithCalls.length} tienen llamada relacionada
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No hay relacionadas
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