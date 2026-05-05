import { EmptyState, PageHeader } from "@/components/data-state";
import { Card, CardContent } from "@/components/ui/card";
import { getStockMovements } from "@/lib/query";

export default async function HistoryPage() {
  const movements = await getStockMovements().catch(() => []);

  return (
    <>
      <PageHeader title="Stock Movement History" description="Audit trail for sales, cancellations, returns, restocks, and adjustments." />
      {movements.length === 0 ? (
        <EmptyState title="No stock movements" description="Completing or canceling sales will create stock movement logs." />
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => (
            <Card key={movement.id} className="rounded-lg">
              <CardContent className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="space-y-2">
                  <span className="mb-4">{ movement.sale ?? ""}</span>
                  <p className="font-medium">{movement.product_name}</p>
                  <p className="text-sm text-muted-foreground"> Color: {movement.color || "None"} </p>
                  <p className="text-sm text-muted-foreground"> Size: {movement.size || "None"}</p>
                </div>
                <p className="text-sm capitalize">{movement.movement_type}</p>
                <p className={movement.quantity_change < 0 ? "text-sm font-semibold text-rose-600" : "text-sm font-semibold text-emerald-600"}>
                  {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
