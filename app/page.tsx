import { EmptyState, PageHeader } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, getInventory } from "@/lib/query";

export default async function Home() {
  const variants = await getInventory().catch(() => []);

  return (
    <>
      <PageHeader
        title="Available Stocks"
        description=""
      
      />

      {variants.length === 0 ? (
        <EmptyState title="No inventory yet" description="Add products and variants to start tracking stock." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-2">
          {variants.map((variant) => (
            <Card key={variant.id} className="rounded-lg p-4">
              <CardHeader>
                <CardTitle>{variant.product_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{variant.product_description || ""}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1 grid-cols-2 justify-content items-center text-sm space-y-2">
                  <div className="flex-start">
                    <p className="text-muted-foreground">Color</p>
                    <p className="font-medium">{variant.color || "None"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{variant.size || "None"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-medium">{variant.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{formatMoney(variant.price)}</p>
                  </div>
                </div>
                <StatusBadge value={variant.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
