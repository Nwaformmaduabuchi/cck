"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, getCompletedSales, returnSaleItems } from "@/lib/query";
import type { Sale } from "@/lib/types";

type ReturnDraft = Record<number, string>;

export function CompletedSalesWorkspace({ initialSales }: { initialSales: Sale[] }) {
  const [sales, setSales] = useState(initialSales);
  const [returnDrafts, setReturnDrafts] = useState<ReturnDraft>({});
  const [activeSaleId, setActiveSaleId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedItems = useMemo(
    () =>
      Object.entries(returnDrafts)
        .map(([saleItemId, quantity]) => ({
          sale_item_id: Number(saleItemId),
          quantity: Number(quantity),
        }))
        .filter((item) => item.quantity > 0),
    [returnDrafts]
  );

  if (sales.length === 0) {
    return (
      <EmptyState
        title="No completed sales"
        description="Completed sales will appear here after inventory is applied."
      />
    );
  }

  function setReturnQuantity(saleId: number, saleItemId: number, quantity: string) {
    setActiveSaleId(saleId);
    setReturnDrafts((current) => ({ ...current, [saleItemId]: quantity }));
  }

  function submitReturns(saleId: number) {
    setMessage("");
    setError("");

    const sale = sales.find((item) => item.id === saleId);
    const itemsForSale = selectedItems.filter((item) =>
      sale?.items.some((saleItem) => saleItem.id === item.sale_item_id)
    );

    if (!itemsForSale.length) {
      setError("Enter a return quantity for at least one item.");
      return;
    }

    const invalidItem = itemsForSale.find((item) => {
      const saleItem = sale?.items.find((candidate) => candidate.id === item.sale_item_id);
      const returnable = (saleItem?.quantity ?? 0) - (saleItem?.returned_quantity ?? 0);
      return item.quantity > returnable;
    });

    if (invalidItem) {
      setError("Return quantity cannot be more than the remaining sold quantity.");
      return;
    }

    startTransition(async () => {
      try {
        await returnSaleItems(saleId, {
          idempotency_key: crypto.randomUUID(),
          reason: "Customer return",
          items: itemsForSale,
        });
        const refreshedSales = await getCompletedSales();
        setSales(refreshedSales);
        setReturnDrafts({});
        setActiveSaleId(null);
        setMessage("Return saved and inventory restored.");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save this return.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {sales.map((sale) => (
        <Card key={sale.id} className="overflow-hidden rounded-lg">
          <CardHeader className="border-b bg-muted/20 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">Sale {sale.id}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground flex flex-col gap-1 lg:flex-row lg:gap-4">
                  <span>Customer: {sale.customer?.name || "Walk-in customer"}</span>
                  <span>Seller: {sale.seller || "Unassigned"}</span>
                   
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={sale.status} />
                <p className="text-sm text-muted-foreground">
                  Returned {formatMoney(sale.returned_total)}
                </p>
                <p className="text-lg font-semibold">{formatMoney(sale.net_total)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            <div className="hidden overflow-hidden rounded-lg border lg:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="w-28 px-4 py-3 text-right">Sold</th>
                    <th className="w-28 px-4 py-3 text-right">Returned</th>
                    <th className="w-32 px-4 py-3 text-right">Return now</th>
                    <th className="w-36 px-4 py-3 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => {
                    const remaining = item.quantity - item.returned_quantity;
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <p className="font-medium mb-2">{item.product_name}</p>
                          <p className="text-xs flex flex-col gap-1">
                            <span className="text-muted-foreground">Color: {item.color || "None"}</span>
                            <span className="text-muted-foreground">Size: {item.size || "None"}</span>
                            
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          <ReturnedPill returned={item.returned_quantity} sold={item.quantity} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Input
                            type="number"
                            min="0"
                            max={remaining}
                            value={returnDrafts[item.id] ?? ""}
                            disabled={remaining <= 0}
                            className="ml-auto w-24 text-right"
                            onChange={(event) =>
                              setReturnQuantity(sale.id, item.id, event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatMoney(item.line_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 lg:hidden">
              {sale.items.map((item) => {
                const remaining = item.quantity - item.returned_quantity;
                return (
                  <div key={item.id} className="space-y-3 rounded-lg border bg-muted/20 p-3">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color || "No color"} / {item.size || "No size"}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Sold</p>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Returned</p>
                        <ReturnedPill returned={item.returned_quantity} sold={item.quantity} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium">{formatMoney(item.line_total)}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Return quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        max={remaining}
                        value={returnDrafts[item.id] ?? ""}
                        disabled={remaining <= 0}
                        onChange={(event) =>
                          setReturnQuantity(sale.id, item.id, event.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {sale.returns.length ? (
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium">Return history</p>
                <div className="mt-2 space-y-2">
                  {sale.returns.map((saleReturn) => (
                    <div key={saleReturn.id} className="flex flex-wrap justify-between gap-2">
                      <span>{saleReturn.items.length} item group(s) returned</span>
                      <span className="font-medium">{formatMoney(saleReturn.refund_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end border-t pt-4">
              <Button
                type="button"
                onClick={() => submitReturns(sale.id)}
                disabled={isPending || (activeSaleId !== null && activeSaleId !== sale.id)}
              >
                <RotateCcw /> {isPending && activeSaleId === sale.id ? "Saving..." : "Save return"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReturnedPill({ returned, sold }: { returned: number; sold: number }) {
  const fullyReturned = returned >= sold;

  return (
    <span
      className={
        fullyReturned
          ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
          : "inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
      }
    >
      {returned} / {sold}
    </span>
  );
}
