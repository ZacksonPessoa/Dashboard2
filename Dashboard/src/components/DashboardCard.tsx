import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export const DashboardCard = ({ title, value, icon: Icon, description }: DashboardCardProps) => {
  return (
    <Card className="group border-0 shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
