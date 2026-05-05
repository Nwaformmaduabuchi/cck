"use client";

import { useStockForm } from "@/lib/state";
import { Button } from "../button";
import ProductFields from "./ProductFields";
import { createStock } from "@/lib/action";
import { Input } from "../input";
import { Label } from "../label";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { useState, useTransition } from "react";

const StockCreatForm = () => {
  const categoryName = useStockForm((state) => state.categoryName);
  const setName = useStockForm((state) => state.setName);
  const products = useStockForm((state) => state.products);
  const addProduct = useStockForm((state) => state.addProduct);
  const resetStockForm = useStockForm((state) => state.resetStockForm);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitStock(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await createStock(formData);
      if (result?.category) {
        setMessage("Stock registered successfully.");
        resetStockForm();
        return;
      }
      setMessage(JSON.stringify(result));
    });
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Create Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submitStock} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="category">Category name</Label>
            <Input
              id="category"
              type="text"
              placeholder="Product category name"
              value={categoryName}
              onChange={(e) => setName(e.target.value)}
            />

            <input type="hidden" name="payload" value={JSON.stringify({
              category: {
                name: categoryName
              }, 
              products: products.map((product) => ({
                name: product.name,
                description: product.description,
                variants: product.variants.map(({ color, size, price, quantity }) => ({
                  color,
                  size,
                  price: price || null,
                  quantity: Number(quantity || 0),
                })),
              }))
            })} />
          </div>


          {products.map((product,index:number) => (
            <ProductFields key={product.id} product={product} index={index} />
          ))}

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => addProduct()}>
              Add product
            </Button>

            <Button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit stock"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockCreatForm;
