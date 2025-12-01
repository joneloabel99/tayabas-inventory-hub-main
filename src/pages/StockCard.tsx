import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StockCard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Card</h1>
        <p className="text-muted-foreground mt-1">View detailed stock movement history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Stock Card Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Stock card module coming soon</p>
            <p className="text-sm mt-2">Track individual item movement history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
