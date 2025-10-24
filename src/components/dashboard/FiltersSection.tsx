import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DashboardFilters, Agent } from "@/hooks/useDashboardData";
import { COUNTRY_COSTS, getCountryCost } from "@/config/countryCosts"; // Importar la configuración de países

interface FiltersSectionProps {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  agents: Agent[];
  loading: boolean;
}



// Configuración de países para el filtro
const COUNTRIES_FOR_FILTER = [
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'arg', name: 'Argentina', flag: '🇦🇷' },
  { code: 'mx', name: 'México', flag: '🇲🇽' },
  { code: 'esp', name: 'España', flag: '🇪🇸' }
];

export const FiltersSection = ({ filters, onFilterChange, agents, loading }: FiltersSectionProps) => {
  return (
    <Card className="p-6 mb-6 shadow-metric">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Agente */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Agente
          </label>
          <Select 
            value={filters.agent} 
            onValueChange={(value) => onFilterChange({ agent: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los agentes</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro de Tipo de Llamada */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Tipo de llamada
          </label>
          <Select 
            value={filters.callType} 
            onValueChange={(value) => onFilterChange({ callType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de llamada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las llamadas</SelectItem>
              <SelectItem value="inbound">Entrantes</SelectItem>
              <SelectItem value="outbound">Salientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de País - CORREGIDO */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            País
          </label>
          <Select 
            value={filters.country} 
            onValueChange={(value) => onFilterChange({ country: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {COUNTRIES_FOR_FILTER.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro de Estado */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Estado
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange({ status: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="successful">Exitosas</SelectItem>
              <SelectItem value="failed">Fallidas</SelectItem>
              <SelectItem value="transferred">Transferidas</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro de Canal */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Canal
          </label>
          <Select 
            value={filters.channel} 
            onValueChange={(value) => onFilterChange({ channel: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              <SelectItem value="voz">Teléfono</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Rango de Tiempo */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Período
          </label>
          <Select 
            value={filters.timeRange} 
            onValueChange={(value) => onFilterChange({ timeRange: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el período</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

