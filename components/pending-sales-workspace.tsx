"use client";

import { CheckCircle2, Minus, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  completeSale,
  deletePendingSaleItem,
  formatMoney,
  updatePendingSale,
} from "@/lib/query";
import type { InventoryVariant, Sale, SaleItem } from "@/lib/types";

type EditableItem = {
  localId: string;
  id?: number;
  variantId: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: string;
};

function toEditableItem(item: SaleItem): EditableItem {
  return {
    localId: String(item.id),
    id: item.id,
    variantId: String(item.variant_id),
    color: String(item.variant_id),
    size: String(item.variant_id),
    quantity: item.quantity,
    unitPrice: item.unit_price,
  };
}

function saleToDraft(sale: Sale) {
  return {
    customerName: sale.customer?.name ?? "Walk-in customer",
    customerPhone: sale.customer?.phone ?? "",
    customerAddress: sale.customer?.address ?? "",
    seller: sale.seller ?? "",
    items: sale.items.map(toEditableItem),
  };
}

export function PendingSalesWorkspace({
  initialSales,
  variants,
}: {
  initialSales: Sale[];
  variants: InventoryVariant[];
}) {
  const [sales, setSales] = useState(initialSales);

  if (sales.length === 0) {
    return (
      <EmptyState
        title="No pending sales"
        description="New sales created from the sale form will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <PendingSaleEditor
          key={sale.id}
          sale={sale}
          variants={variants}
          onSaved={(updatedSale) =>
            setSales((current) =>
              current.map((item) => (item.id === updatedSale.id ? updatedSale : item))
            )
          }
          onCompleted={(completedSale) =>
            setSales((current) => current.filter((item) => item.id !== completedSale.id))
          }
        />
      ))}
    </div>
  );
}

function PendingSaleEditor({
  sale,
  variants,
  onSaved,
  onCompleted,
}: {
  sale: Sale;
  variants: InventoryVariant[];
  onSaved: (sale: Sale) => void;
  onCompleted: (sale: Sale) => void;
}) {
  const [draft, setDraft] = useState(() => saleToDraft(sale));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const variantMap = useMemo(
    () => new Map(variants.map((variant) => [String(variant.id), variant])),
    [variants]
  );

  const total = draft.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice || 0),
    0
  );

  function updateItem(localId: string, patch: Partial<EditableItem>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item
      ),
    }));
  }

  function addItem() {
    const firstVariant = variants[0];
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          localId: crypto.randomUUID(),
          variantId: firstVariant ? String(firstVariant.id) : "",
          color: firstVariant ? String(firstVariant.id) : "",
          size: firstVariant ? String(firstVariant.id) : "",
          quantity: 1,
          unitPrice: firstVariant?.price ?? "0.00",
        },
      ],
    }));
  }

  function removeItem(item: EditableItem) {
    setMessage("");
    setError("");

    if (draft.items.length <= 1) {
      setError("A pending sale must keep at least one item.");
      return;
    }

    if (!item.id) {
      setDraft((current) => ({
        ...current,
        items: current.items.filter((candidate) => candidate.localId !== item.localId),
      }));
      return;
    }

    startTransition(async () => {
      try {
        const updatedSale = await deletePendingSaleItem(sale.id, item.id as number);
        setDraft(saleToDraft(updatedSale));
        onSaved(updatedSale);
        setMessage("Sale item deleted.");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not delete this item.");
      }
    });
  }

  async function saveDraft() {
    const payload = {
      customer: {
        name: draft.customerName.trim() || "Walk-in customer",
        phone: draft.customerPhone.trim() || undefined,
        address: draft.customerAddress.trim() || undefined,
      },
      seller: draft.seller.trim() || undefined,
      items: draft.items.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        variant_id: Number(item.variantId),
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };

    return updatePendingSale(sale.id, payload);
  }

  function handleSave() {
    setMessage("");
    setError("");

    if (!draft.items.length) {
      setError("A pending sale must keep at least one item.");
      return;
    }

    startTransition(async () => {
      try {
        const updatedSale = await saveDraft();
        setDraft(saleToDraft(updatedSale));
        onSaved(updatedSale);
        setMessage("Pending sale saved.");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save this sale.");
      }
    });
  }

  function handleComplete() {
    setMessage("");
    setError("");

    if (!draft.items.length) {
      setError("A pending sale must keep at least one item.");
      return;
    }

    startTransition(async () => {
      try {
        await saveDraft();
        const completedSale = await completeSale(sale.id);
        onCompleted(completedSale);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not complete this sale.");
      }
    });
  }

  return (
    <Card className="overflow-hidden rounded-lg">
      <CardHeader className="border-b bg-muted/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Sale {sale.id}</CardTitle>
            
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge value={sale.status} />
            <p className="text-lg font-semibold">{formatMoney(total)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Input
              value={draft.customerName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, customerName: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input
              value={draft.customerPhone}
              onChange={(event) =>
                setDraft((current) => ({ ...current, customerPhone: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Seller</Label>
            <Input
              value={draft.seller}
              onChange={(event) =>
                setDraft((current) => ({ ...current, seller: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-lg border lg:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="w-36 px-4 py-3 text-left">Quantity</th>
                <th className="w-36 px-4 py-3 text-left">Unit price</th>
                <th className="w-36 px-4 py-3 text-right">Line total</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {draft.items.map((item) => (
                <EditableItemRow
                  key={item.localId}
                  item={item}
                  variants={variants}
                  variantMap={variantMap}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  canRemove={draft.items.length > 1}
                  isPending={isPending}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {draft.items.map((item) => (
            <EditableItemCard
              key={item.localId}
              item={item}
              variants={variants}
              variantMap={variantMap}
              updateItem={updateItem}
              removeItem={removeItem}
              canRemove={draft.items.length > 1}
              isPending={isPending}
            />
          ))}
        </div>

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

        <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={addItem} disabled={!variants.length}>
            <Plus /> Add item
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleSave} disabled={isPending}>
              <Save /> {isPending ? "Working..." : "Save changes"}
            </Button>
            <Button type="button" onClick={handleComplete} disabled={isPending}>
              <CheckCircle2 /> Complete sale
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditableItemRow({
  item,
  variants,
  variantMap,
  updateItem,
  removeItem,
  canRemove,
  isPending,
}: {
  item: EditableItem;
  variants: InventoryVariant[];
  variantMap: Map<string, InventoryVariant>;
  updateItem: (localId: string, patch: Partial<EditableItem>) => void;
  removeItem: (item: EditableItem) => void;
  canRemove: boolean;
  isPending: boolean;
}) {
  const lineTotal = item.quantity * Number(item.unitPrice || 0);
  const handleVariantChange = (value: string) => {
    const variant = variantMap.get(value);
    updateItem(item.localId, {
      variantId: value,
      color: value,
      size: value,
      unitPrice: variant?.price ?? item.unitPrice,
    });
  };

  return (
    <tr className="border-t">
      <td className="px-4 py-3">
        <VariantSelectGroup
          item={item}
          variants={variants}
          onChange={handleVariantChange}
        />
      </td>
      <td className="px-4 py-3">
        <QuantityControl item={item} updateItem={updateItem} />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(event) => updateItem(item.localId, { unitPrice: event.target.value })}
        />
      </td>
      <td className="px-4 py-3 text-right font-medium">{formatMoney(lineTotal)}</td>
      <td className="px-4 py-3">
        {!item.id && <Button
          type="button"
          variant= "destructive" 
          size="icon"
          onClick={() => removeItem(item)}
          disabled={!canRemove || isPending}
          aria-label="Remove sale item"
        >
          <Trash2 /> 
          
        </Button>}
        
      </td>
    </tr>
  );
}

function EditableItemCard(props: {
  item: EditableItem;
  variants: InventoryVariant[];
  variantMap: Map<string, InventoryVariant>;
  updateItem: (localId: string, patch: Partial<EditableItem>) => void;
  removeItem: (item: EditableItem) => void;
  canRemove: boolean;
  isPending: boolean;
}) {
  const { item, variants, variantMap, updateItem, removeItem, canRemove, isPending } = props;
  const lineTotal = item.quantity * Number(item.unitPrice || 0);
  const handleVariantChange = (value: string) => {
    const variant = variantMap.get(value);
    updateItem(item.localId, {
      variantId: value,
      color: value,
      size: value,
      unitPrice: variant?.price ?? item.unitPrice,
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <VariantSelectGroup
        item={item}
        variants={variants}
        onChange={handleVariantChange}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Quantity</Label>
          <QuantityControl item={item} updateItem={updateItem} />
        </div>
        <div className="grid gap-2">
          <Label>Unit price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(event) => updateItem(item.localId, { unitPrice: event.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{formatMoney(lineTotal)}</p>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => removeItem(item)}
          disabled={!canRemove || isPending}
          aria-label="Remove sale item"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function VariantSelectGroup({
  item,
  variants,
  onChange,
}: {
  item: EditableItem;
  variants: InventoryVariant[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Sale item</Label>
      <Select value={item.variantId} onValueChange={onChange}>
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

      <Select value={item.color} onValueChange={onChange}>
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

      <Select value={item.size} onValueChange={onChange}>
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
    </div>
  );
}

function QuantityControl({
  item,
  updateItem,
}: {
  item: EditableItem;
  updateItem: (localId: string, patch: Partial<EditableItem>) => void;
}) {
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-lg border bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-none"
        onClick={() => updateItem(item.localId, { quantity: Math.max(1, item.quantity - 1) })}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <Input
        type="number"
        min="1"
        value={item.quantity}
        className="h-8 rounded-none border-0 text-center focus-visible:ring-0"
        onChange={(event) =>
          updateItem(item.localId, {
            quantity: Math.max(1, Number(event.target.value || 1)),
          })
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-none"
        onClick={() => updateItem(item.localId, { quantity: item.quantity + 1 })}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}
