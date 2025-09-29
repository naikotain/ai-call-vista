import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DashboardHeader = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-primary-foreground/80">Monitor y analiza el rendimiento de tus llamadas de IA</p>
          </div>
          <div className="min-w-[200px]">
          </div>
        </div>
      </div>
    </header>
  );
};