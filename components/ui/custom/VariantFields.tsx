"use client";

import { useStockForm } from "@/lib/state";
import { DraftStockVariant } from "@/lib/types";
import { Input } from "../input";
import { Label } from "../label";
import { Button } from "../button";

import { Trash2Icon } from "lucide-react";

const VariantFields = ({
  variant,
  productId,
  idx,
}: {
  variant: DraftStockVariant;
  productId: string;
  idx:number
}) => {
  const updateVariant = useStockForm((state) => state.updateVariant);
  const deleteVariant = useStockForm((state) => state.deleteVariant);

  return (
    <div className="border p-2 rounded-lg space-y-2">
      <div className="flex justify-between px-2 py-1">
      <span className="w-fit self-start inline-flex items-center rounded-full bg-background  px-4 py-1.5 text-lg text-foreground">
   {idx + 1}
     </span>
     <Button type="button" className="mt-3 rounded-full px-2 text-lg py-3 " variant="destructive" onClick={() => deleteVariant(productId, variant.id)}>
        <Trash2Icon />
      </Button>
      </div>
      
    <div className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-4">
      
      <div className="grid gap-2">
        <Label htmlFor={`variant-color-${variant.id}`}>Color</Label>
        <Input
          type="text"
          id={`variant-color-${variant.id}`}
          name="color"
          value={variant.color}
          onChange={(e) =>
            updateVariant( productId,variant.id, "color", e.target.value)
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`variant-size-${variant.id}`}>Size</Label>
        <Input
          type="text"
          id={`variant-size-${variant.id}`}
          name="size"
          value={variant.size}
          onChange={(e) =>
            updateVariant( productId,variant.id, "size", e.target.value)
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`variant-quantity-${variant.id}`}>Quantity</Label>
        <Input
          type="number"
          id={`variant-quantity-${variant.id}`}
          name="quantity"
          value={variant.quantity}
          onChange={(e) =>
            updateVariant(
              productId,
              variant.id,
              "quantity",
              e.target.value
            )
          }
        />
      </div>

    </div>
    </div>
  );
};

export default VariantFields;
