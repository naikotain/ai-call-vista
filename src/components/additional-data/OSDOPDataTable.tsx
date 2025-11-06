import React, { useState, useEffect } from 'react';
import { OSDOPClientData } from '../../types/additional-data';
import { OSDOPDataService } from '../../services/osdop-data-service';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '../../config/clients';

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

  useEffect(() => {
    console.log('🔗 Cargando datos para cliente:', clientId);
    if (clientId && CLIENT_CONFIGS[clientId]) {
      loadData();
    }
  }, [clientId]);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Datos de Consultas y Trámites</CardTitle>
        <CardDescription>
          Información completa de consultas - {data.length} registros
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Cliente: {clientId}
          </span>
        </CardDescription>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando datos...</p>
          </div>
        ) : data.length > 0 ? (
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
        )}
      </CardContent>
    </Card>
  );
};