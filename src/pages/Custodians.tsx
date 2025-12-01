import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustodians } from "@/hooks/useCustodians";

export default function Custodians() {
  const { custodians, isLoading } = useCustodians();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Custodians</h1>
        <p className="text-muted-foreground mt-1">Manage custodians and assigned assets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Custodians
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading custodians...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {custodians.map((custodian) => (
              <Card key={custodian.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {custodian.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{custodian.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{custodian.department}</p>
                      <p className="text-xs text-muted-foreground mt-1">{custodian.email}</p>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Items Assigned</p>
                          <p className="text-lg font-semibold text-foreground">{custodian.itemsAssigned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="text-lg font-semibold text-foreground">₱{(custodian.totalValue / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
