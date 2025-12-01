import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PhysicalCount() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Physical Count</h1>
        <p className="text-muted-foreground mt-1">Conduct and record physical inventory counts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Physical Count Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Physical count module coming soon</p>
            <p className="text-sm mt-2">Schedule and conduct inventory audits</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
