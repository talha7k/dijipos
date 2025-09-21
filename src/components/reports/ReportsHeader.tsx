import { PieChart } from "lucide-react";

export function ReportsHeader() {
  return (
    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
      <PieChart className="h-8 w-8" />
      Reports
    </h1>
  );
}
