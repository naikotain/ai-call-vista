import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OSDOPClientData } from '../../types/normalized';
import { OSDOPDataService } from '../../services/osdop-data-service';
import { CLIENT_CONFIGS } from '../../config/clients';
import { getCurrentClientId } from '@/lib/supabase-client';
import { getAdditionalDataConfig } from '../../config/additional-data-config';
import { useDashboardData } from '../../hooks/useDashboardData';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { RefreshCw, ChevronRight, ChevronLeft, Search, X, Eye, EyeOff, Phone } from 'lucide-react';

// ✅ FUNCIONES AUXILIARES
const getFieldValue = (item: any, key: string) => {
  if (key.startsWith('custom_fields.')) {
    const fieldPath = key.replace('custom_fields.', '');
    const value = fieldPath.split('.').reduce((obj, prop) => obj?.[prop], item.custom_fields);
    return value || '-';
  }
  return item[key] || '-';
};

const formatFieldValue = (value: any, clientConfig: any, fieldKey: string) => {
  const fieldConfig = clientConfig.fieldConfig?.[fieldKey];
  
  if (fieldConfig?.type === 'currency') {
    const numericValue = parseFloat(value?.toString().replace(/[^\d.,]/g, '')?.replace(',', '.') || '0');
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: fieldConfig.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  }
  
  if (fieldConfig?.type === 'badge') {
    const variant = fieldConfig.variants?.[value] || 'default';
    return <Badge variant={variant as any}>{value}</Badge>;
  }
  
  if (fieldConfig?.type === 'date' && value) {
    try {
      return new Date(value).toLocaleDateString('es-ES');
    } catch {
      return value;
    }
  }
  
  return value;
};

// ✅ FUNCIÓN DE BÚSQUEDA UNIFICADA
const searchInData = (data: any[], searchTerm: string, clientConfig: any): any[] => {
  if (!searchTerm.trim()) return data;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return data.filter(item => {
    // Buscar en todos los campos visibles de la tabla
    return clientConfig.columns.some((column: any) => {
      const value = getFieldValue(item, column.key);
      const stringValue = typeof value === 'object' && value !== null 
        ? JSON.stringify(value) 
        : String(value || '');
      
      return stringValue.toLowerCase().includes(lowerSearchTerm);
    }) || 
    // También buscar en campos de llamada si existen
    (item.call_data && Object.values(item.call_data).some((callValue: any) => {
      if (typeof callValue === 'string') {
        return callValue.toLowerCase().includes(lowerSearchTerm);
      }
      if (typeof callValue === 'number' || typeof callValue === 'boolean') {
        return callValue.toString().toLowerCase().includes(lowerSearchTerm);
      }
      return false;
    }));
  });
};

// ✅ FUNCIÓN PARA DETERMINAR CAMPOS IMPORTANTES POR CLIENTE
const getImportantColumns = (allColumns: any[], clientId: string) => {
  if (clientId === 'cliente3') {
    // Para inmobiliaria: campos críticos
    const importantKeys = [
      'nombre', 'telefono', 'email', 'calle_interesa', 
      'precio_interesa', 'comentarios', 'fecha_contacto',
      'compra_alquiler', 'tipo_propiedad', 'precio_maximo'
    ];
    
    return allColumns.filter(col => 
      importantKeys.some(key => 
        col.key.toLowerCase().includes(key.toLowerCase())
      )
    ).slice(0, 8); // Máximo 8 campos importantes
  }
  
  // Para otros clientes: primeros 6 campos
  return allColumns.slice(0, 6);
};

// ✅ COMPONENTE PRINCIPAL UNIFICADO
export const OSDOPDataTable: React.FC = () => {
  const clientId = getCurrentClientId();
  const [data, setData] = useState<OSDOPClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllColumns, setShowAllColumns] = useState(false);

  const clientConfig = getAdditionalDataConfig(clientId);
  const { 
    additionalDataWithCalls, 
    fetchAdditionalDataWithCalls,
    relationshipStats,
    loading: dashboardLoading 
  } = useDashboardData();

  // ✅ CARGAR DATOS CON LLAMADAS INTEGRADAS
  useEffect(() => {
    if (clientId && CLIENT_CONFIGS[clientId]) {
      loadData();
      // También cargar datos con llamadas para tenerlos listos
      fetchAdditionalDataWithCalls();
    }
  }, [clientId]);

  const loadData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const result = await OSDOPDataService.getOSDOPData(clientId, {});
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Funciones para scroll
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollToStart = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // ✅ COMBINAR DATOS CON INFORMACIÓN DE LLAMADAS
  const dataWithCalls = useMemo(() => {
    // Crear un mapa de call_id_retell a datos de llamada para búsqueda rápida
    const callsMap = new Map();
    additionalDataWithCalls.forEach(item => {
      if (item.call_id_retell && item.call_data) {
        callsMap.set(item.call_id_retell, item.call_data);
      }
    });
    
    // Combinar datos con información de llamadas
    return data.map(item => {
      const callData = callsMap.get(item.call_id_retell) || null;
      return {
        ...item,
        call_data: callData,
        // Agregar indicador visual si tiene llamada
        has_call: !!callData
      };
    });
  }, [data, additionalDataWithCalls]);

  // ✅ FILTRAR DATOS CON BÚSQUEDA
  const filteredData = useMemo(() => {
    return searchInData(dataWithCalls, searchTerm, clientConfig);
  }, [dataWithCalls, searchTerm, clientConfig]);

  // ✅ DETERMINAR QUÉ COLUMNAS MOSTRAR
  const allColumns = clientConfig.columns;
  const importantColumns = useMemo(() => 
    getImportantColumns(allColumns, clientId), 
    [allColumns, clientId]
  );
  
  const secondaryColumns = useMemo(() => 
    allColumns.filter(col => 
      !importantColumns.some(imp => imp.key === col.key)
    ), 
    [allColumns, importantColumns]
  );

  const displayColumns = showAllColumns 
    ? [...importantColumns, ...secondaryColumns]
    : importantColumns;

  // ✅ DETECTAR SI HAY MÁS COLUMNAS QUE ANCHO DISPONIBLE
  const [needsHorizontalScroll, setNeedsHorizontalScroll] = useState(false);
  
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (tableContainerRef.current) {
        const containerWidth = tableContainerRef.current.clientWidth;
        const tableWidth = tableContainerRef.current.scrollWidth;
        setNeedsHorizontalScroll(tableWidth > containerWidth);
      }
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);
    
    const timer = setTimeout(checkScrollNeeded, 100);
    
    return () => {
      window.removeEventListener('resize', checkScrollNeeded);
      clearTimeout(timer);
    };
  }, [filteredData, displayColumns]);

  const isLoading = loading || dashboardLoading;
  const displayData = filteredData;
  const totalRecords = data.length;

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3 bg-card border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {clientConfig.tableTitle}
              {showAllColumns && (
                <Badge variant="outline" className="text-xs">
                  Vista completa
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {displayData.length}{searchTerm ? ` de ${totalRecords}` : ''} registros • 
              Cliente: <span className="font-medium">{clientId}</span>
              {displayData.some(item => item.has_call) && (
                <span className="ml-2">
                  • <span className="text-green-500">{displayData.filter(item => item.has_call).length}</span> con llamadas
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ✅ BÚSQUEDA MEJORADA */}
            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar en todos los campos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 pr-10 h-9 w-48 sm:w-56"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(true)}
                  className="h-9"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              )}
              
              {searchTerm && !showSearch && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">
                    "{searchTerm}"
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* ✅ TOGGLE DE VISTA COMPLETA */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllColumns(!showAllColumns)}
              className="h-9"
            >
              {showAllColumns ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Menos campos
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Todos los campos
                </>
              )}
            </Button>
            
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="h-9"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* ✅ INDICADOR DE BÚSQUEDA ACTIVA */}
        {searchTerm && (
          <div className="mt-2 text-sm flex items-center justify-between">
            <div className="text-muted-foreground">
              🔍 Búsqueda activa
              {displayData.length === 0 && (
                <span className="ml-2 text-amber-500">
                  • No se encontraron resultados
                </span>
              )}
            </div>
            {displayData.length > 0 && (
              <div className="text-sm font-medium">
                {displayData.length} resultado{displayData.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
        
        {/* ✅ INFO DE COLUMNAS VISIBLES */}
        <div className="mt-2 text-xs text-muted-foreground">
          Mostrando {displayColumns.length} de {allColumns.length} campos
          {secondaryColumns.length > 0 && !showAllColumns && (
            <span className="ml-2">
              • <button 
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={() => setShowAllColumns(true)}
              >
                Ver {secondaryColumns.length} más
              </button>
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        {/* ✅ CONTENEDOR DE TABLA */}
        <div className="relative">
          {/* ✅ CONTROLES DE SCROLL */}
          {needsHorizontalScroll && displayData.length > 0 && (
            <>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-30 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border-border shadow-lg"
                  onClick={scrollLeft}
                  title="Desplazar izquierda"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-30 mr-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border-border shadow-lg"
                  onClick={scrollRight}
                  title="Desplazar derecha"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          
          {/* ✅ TABLA UNIFICADA CON TODO INTEGRADO */}
          <div 
            ref={tableContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[500px] scroll-smooth relative"
          >
            <div className="min-w-full inline-block">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {displayColumns.map((column: any) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap bg-gray-900 border-b border-gray-700"
                        style={{ 
                          position: 'sticky',
                          top: 0,
                          zIndex: 20
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{column.displayName}</span>
                          {importantColumns.some(c => c.key === column.key) && !showAllColumns && (
                            <span className="text-[10px] text-blue-400 ml-1">★</span>
                          )}
                        </div>
                      </th>
                    ))}
                    
                    {/* ✅ COLUMNA DE LLAMADAS INTEGRADA (siempre visible) */}
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap bg-gray-900 border-b border-gray-700"
                      style={{ 
                        position: 'sticky',
                        top: 0,
                        zIndex: 20
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Contacto</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-800 bg-gray-950">
                  {displayData.length > 0 ? (
                    displayData.map((item: any, index: number) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-gray-800/30 ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/10'}`}
                      >
                        {displayColumns.map((column: any) => (
                          <td
                            key={`${item.id}-${column.key}`}
                            className="px-4 py-3 text-sm whitespace-nowrap"
                          >
                            <div 
                              className="max-w-[200px] truncate hover:whitespace-normal hover:max-w-none transition-all duration-200 cursor-help" 
                              title={String(getFieldValue(item, column.key))}
                            >
                              {formatFieldValue(getFieldValue(item, column.key), clientConfig, column.key)}
                            </div>
                          </td>
                        ))}
                        
                        {/* ✅ CELDA DE LLAMADA INTEGRADA */}
                        <td className="px-4 py-3">
                          {item.call_data ? (
                            <div className="space-y-1 min-w-[100px]">
                              <div className="flex items-center gap-1">
                                <Badge variant={
                                  item.call_data.status === 'successful' ? 'default' :
                                  item.call_data.status === 'failed' ? 'destructive' : 'secondary'
                                } className="text-xs">
                                  {item.call_data.status || 'N/A'}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(item.call_data.started_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              {item.call_data.customer_phone && (
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  📞 {item.call_data.customer_phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                              <span className="text-xs text-muted-foreground">—</span>
                              <span className="text-[10px] text-muted-foreground mt-1">
                                Sin llamada
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={displayColumns.length + 1} 
                        className="px-4 py-12 text-center"
                      >
                        <div className="text-center space-y-3">
                          <div className="text-muted-foreground text-lg">
                            {isLoading 
                              ? 'Cargando datos...'
                              : searchTerm 
                                ? `No se encontraron resultados para "${searchTerm}"`
                                : 'No hay datos para mostrar'
                            }
                          </div>
                          {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                              Intenta con términos diferentes o{' '}
                              <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={() => setSearchTerm('')}
                              >
                                limpiar la búsqueda
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* ✅ INDICADOR DE SCROLL */}
          {needsHorizontalScroll && displayData.length > 0 && (
            <div className="border-t border-gray-700 bg-gray-900/50 px-4 py-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ChevronLeft className="h-3 w-3" />
                  <span>Desplázate horizontalmente para ver más columnas</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToStart}
                  className="h-7 text-xs"
                >
                  ↶ Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* ✅ PIE DE PÁGINA CON INFORMACIÓN MEJORADA */}
        <div className="px-4 py-3 border-t bg-gray-900/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">{displayData.length}</span> registro{displayData.length !== 1 ? 's' : ''} 
              {searchTerm ? ' encontrados' : ' mostrados'}
              {searchTerm && (
                <span className="ml-2">
                  • Filtrado por: <span className="font-medium text-blue-400">"{searchTerm}"</span>
                </span>
              )}
              {searchTerm && displayData.length < totalRecords && (
                <span className="ml-2 text-amber-500">
                  (de {totalRecords} total)
                </span>
              )}
              {displayData.some(item => item.has_call) && (
                <span className="ml-2 text-green-500">
                  • {displayData.filter(item => item.has_call).length} con llamadas
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                {displayColumns.length}/{allColumns.length} campos
                {showAllColumns ? ' (completos)' : ' (principales)'}
              </div>
              
              {needsHorizontalScroll && displayData.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Usa</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">→</kbd>
                  <span>para navegar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ ESTILOS MEJORADOS
const unifiedStyles = `
  .scroll-smooth {
    scroll-behavior: smooth;
  }
  
  .scroll-smooth::-webkit-scrollbar {
    height: 10px;
    width: 10px;
  }
  
  .scroll-smooth::-webkit-scrollbar-track {
    background: #111827;
    border-radius: 4px;
  }
  
  .scroll-smooth::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 4px;
    border: 2px solid #111827;
  }
  
  .scroll-smooth::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
  
  thead th {
    position: sticky;
    top: 0;
    background: #111827 !important;
    z-index: 20;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  [title] {
    position: relative;
  }
  
  [title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 0;
    transform: translateX(0);
    background: #111827;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 1000;
    max-width: 400px;
    white-space: pre-wrap;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 1px solid #374151;
    pointer-events: none;
  }
  
  tr:hover {
    background-color: rgba(59, 130, 246, 0.05) !important;
  }
  
  .truncate {
    transition: all 0.2s ease;
  }
  
  .truncate:hover {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: 4px;
    padding: 2px 4px;
    margin: -2px -4px;
  }
  
  /* Estilo para columnas importantes */
  th .text-blue-400 {
    opacity: 0.7;
  }
`;

// Agregar estilos
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('osdop-table-styles');
  if (existingStyle) existingStyle.remove();
  
  const style = document.createElement('style');
  style.id = 'osdop-table-styles';
  style.textContent = unifiedStyles;
  document.head.appendChild(style);
}