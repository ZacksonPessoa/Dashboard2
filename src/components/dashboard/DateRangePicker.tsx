import { Calendar, ChevronDown } from "lucide-react";

export function DateRangePicker() {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <span>January 2024 - May 2024</span>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
