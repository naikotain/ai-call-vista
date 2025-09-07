import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DashboardFilters, Agent } from "@/hooks/useDashboardData";

interface FiltersSectionProps {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  agents: Agent[];
  loading: boolean;
}

export const FiltersSection = ({ filters, onFilterChange, agents, loading }: FiltersSectionProps) => {
  return (
    <Card className="p-6 mb-6 shadow-metric">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </Card>
  );
};