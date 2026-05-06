"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSale, formatMoney } from "@/lib/query";
import { useSaleDraft } from "@/lib/state";
import type { InventoryVariant } from "@/lib/types";


const saleSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Customer name is required."),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  seller: z.string().optional(),
  status: z.literal("pending"),
  items: z
    .array(
      z.object({
        variant_id: z.number({ error: "Choose an inventory item." }).positive(),
        quantity: z.number().int().positive("Quantity must be at least 1."),
        unit_price: z.string().min(1, "Unit price is required."),
      })
    )
    .min(1, "Add at least one sale item."),
});

export function CreateSaleForm({ variants }: { variants: InventoryVariant[] }) {
  const draft = useSaleDraft();
  
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const variantMap = useMemo(
    () => new Map(variants.map((variant) => [String(variant.id), variant])),
    [variants]
  );

  const draftTotal = draft.items.reduce((total, item) => {
    return total + Number(item.quantity || 0) * Number(item.unitPrice || 0);
  }, 0);

  function submitSale() {
    setErrors([]);
    setMessage("");

    const payload = {
      customer: {
        name: draft.customerName.trim(),
        phone: draft.customerPhone.trim() || undefined,
        address: draft.customerAddress.trim() || undefined,
      },
      seller: draft.seller.trim() || undefined,
      status: "pending" as const,
      items: draft.items.map((item) => ({
        variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        unit_price: item.unitPrice,
      })),
    };

    const parsed = saleSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    const stockErrors = draft.items.flatMap((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) return ["Choose an inventory item."];
      if (Number(item.quantity) > variant.quantity) {
        return [`${variant.product_name} has only ${variant.quantity} available.`];
      }
      return [];
    });

    if (stockErrors.length) {
      setErrors(stockErrors);
      return;
    }

    startTransition(async () => {
      try {
        const sale = await createSale(parsed.data);
        draft.resetSaleDraft();
        setMessage(`Pending sale #${sale.id} created for ${formatMoney(sale.total_price)}.`);
        
      } catch (error) {
        setErrors([error instanceof Error ? error.message : "Could not create sale."]);
      }
    });
  }

  return (
    <Card className="mx-auto max-w-5xl ">
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="customer-name">Customer name</Label>
            <Input id="customer-name" value={draft.customerName} onChange={(event) => draft.setCustomerField("customerName", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input id="customer-phone" value={draft.customerPhone} onChange={(event) => draft.setCustomerField("customerPhone", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer-address">Address</Label>
            <Input id="customer-address" value={draft.customerAddress} onChange={(event) => draft.setCustomerField("customerAddress", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seller">Seller</Label>
            <Input id="seller" value={draft.seller} onChange={(event) => draft.setCustomerField("seller", event.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {draft.items.map((item) => {
            const selectedVariant = variantMap.get(item.variantId);
            return (
              <div key={item.id} className="grid gap-3 rounded-lg border bg-muted/20 p-3 lg:grid-cols-[1fr_120px_140px_40px]">
                <div className="grid gap-2">
                  <Label>Sale item</Label>
                  <Select value={item.variantId} onValueChange={(value) => draft.updateItem(item.id, "variantId", value)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={String(variant.id)} disabled={variant.quantity <= 0}>
                          {variant.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={item.color} onValueChange={(value) => draft.updateItem(item.id, "color", value)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Choose Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={String(variant.id)} disabled={variant.quantity <= 0}>
                          {variant.color || "None"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={item.size} onValueChange={(value) => draft.updateItem(item.id, "size", value)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Choose Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={String(variant.id)} disabled={variant.quantity <= 0}>
                          {variant.size || "None"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVariant ? <p className="text-xs text-muted-foreground">{selectedVariant.product_description}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" value={item.quantity} onChange={(event) => draft.updateItem(item.id, "quantity", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Unit price</Label>
                  <Input type="number" min="0" step="0.01" value={item.unitPrice} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onChange={(event) => draft.updateItem(item.id, "unitPrice", event.target.value)} />
                </div>
                {draft.items.length >1 && (<Button type="button" variant="destructive" size="icon" className="self-end px-2 py-3 rounded-full" onClick={() => draft.removeItem(item.id)} aria-label="Remove item">
                  <Trash2 />
                </Button>)}
                
              </div>
            );
          })}
        </div>

        {errors.length ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        {message ? <p className="rounded-lg border bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}

        <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">Draft total: <span className="font-semibold text-foreground">{formatMoney(draftTotal)}</span></p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={draft.addItem}>
              <Plus /> Add item
            </Button>
            <Button type="button" variant="outline" onClick={draft.resetSaleDraft}>
              Reset Form
            </Button>
            <Button type="button" onClick={submitSale} disabled={isPending || variants.length === 0}>
              {isPending ? "Creating..." : "Create pending sale"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
