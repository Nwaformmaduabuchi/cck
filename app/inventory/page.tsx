import { EmptyState, PageHeader } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInventory } from "@/lib/query";

export default async function InventoryPage() {
  const variants = await getInventory().catch(() => []);

  return (
    <>
      <PageHeader title="Inventory" description="Available stocks and stock warnings." />
      {variants.length === 0 ? (
        <EmptyState title="No stock found" description="Add stocks" />
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <Card key={variant.id} className="rounded-lg">
              <CardContent className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-medium">{variant.product_name}</p>
                  <p className="text-sm text-muted-foreground">{variant.color || "No color"} / {variant.size || "No size"} / {variant.category_name}</p>
                </div>
                <p className="text-sm"><span className="text-muted-foreground">Quantity:</span> {variant.quantity}</p>
                <StatusBadge value={variant.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
