import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DashboardHeader = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Retell AI Analytics Dashboard</h1>
            <p className="text-primary-foreground/80">Monitor y analiza el rendimiento de tus llamadas de IA</p>
          </div>
          <div className="min-w-[200px]">
            <Select defaultValue="month">
              <SelectTrigger className="bg-white/10 border-white/20 text-primary-foreground">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};