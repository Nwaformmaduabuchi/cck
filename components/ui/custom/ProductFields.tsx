"use client";

import { useStockForm } from "@/lib/state";
import { DraftStockProduct } from "@/lib/types";
import VariantFields from "./VariantFields";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Textarea } from "../textarea";
import { Trash2Icon } from "lucide-react";


const ProductFields = ({ product,index }: { product: DraftStockProduct, index:number }) => {
  const updateProduct = useStockForm((state) => state.updateProduct);
  const addVariant = useStockForm((state) => state.addVariant);
  const deleteProduct = useStockForm((state) => state.deleteProduct);
  

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-2">
        <div className="flex justify-between">
          <span className="w-fit self-start inline-flex items-center rounded-full bg-background  px-4 py-1.5 text-lg text-foreground">
            {index + 1}
          </span>
          <Button type="button" className="mt-3 rounded-full px-2 text-lg py-3" variant="destructive"  onClick={() => deleteProduct(product.id)}>
        <Trash2Icon />
      </Button>
        </div>
          
        <Label htmlFor={`product-name-${product.id}`}>Product name</Label>
        <Input
          type="text"
          placeholder="Product name"
          id={`product-name-${product.id}`}
          value={product.name}
          onChange={(e) =>
            updateProduct(product.id, "name", e.target.value)
          }
          name="name"
        />
      </div>

      <div className="mt-3 grid gap-2">
        <Label htmlFor={`product-description-${product.id}`}>
          Product description
        </Label>
        <Textarea
          name="description"
          id={`product-description-${product.id}`}
          placeholder="Describe your product"
          onChange={(e) =>
            updateProduct(product.id, "description", e.target.value)
          }
          value={product.description}
        />
      </div>

      <div className="mt-4 space-y-3">
        {product.variants.map((variant,idx) => (
          <VariantFields
            key={variant.id}
            variant={variant}
            productId={product.id}
            idx={idx}
          />
        ))}
      </div>
        <div className="flex gap-2 p-2">
          <Button type="button" className="mt-3" variant="outline" onClick={() => addVariant(product.id)}>
        Add Variant
      </Button>
        </div>
    </div>
  );
};

export default ProductFields;
