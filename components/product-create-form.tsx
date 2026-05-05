"use client";

import { useState, useTransition } from "react";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { createProduct, createVariant } from "@/lib/query";
import type { Category, Product } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  description: z.string().optional(),
  category: z.number().positive("Choose a category."),
});

const variantSchema = z.object({
  product: z.number().positive("Choose a product."),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.string().optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative."),
});

export function ProductCreateForm({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [isPending, startTransition] = useTransition();

  function submitProduct() {
    setError("");
    setMessage("");
    const parsed = productSchema.safeParse({
      name: productName,
      description,
      category: Number(categoryId),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the product form.");
      return;
    }

    startTransition(async () => {
      try {
        const product = await createProduct({
          ...parsed.data,
          description: parsed.data.description ?? "",
        });
        setMessage(`Created product ${product.name}.`);
        setProductName("");
        setDescription("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create product.");
      }
    });
  }

  function submitVariant() {
    setError("");
    setMessage("");
    const parsed = variantSchema.safeParse({
      product: Number(productId),
      color,
      size,
      price: price || undefined,
      quantity: Number(quantity),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the variant form.");
      return;
    }

    startTransition(async () => {
      try {
        await createVariant({ ...parsed.data, price: parsed.data.price || null });
        setMessage("Created stock variant.");
        setColor("");
        setSize("");
        setPrice("");
        setQuantity("0");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create variant.");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-name">Name</Label>
            <Input id="product-name" value={productName} onChange={(event) => setProductName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <Button type="button" onClick={submitProduct} disabled={isPending || categories.length === 0}>
            Create product
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Create Stock Variant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Choose product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Color</Label>
              <Input value={color} onChange={(event) => setColor(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Size</Label>
              <Input value={size} onChange={(event) => setSize(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Price</Label>
              <Input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </div>
          </div>
          <Button type="button" onClick={submitVariant} disabled={isPending || products.length === 0}>
            Create variant
          </Button>
        </CardContent>
      </Card>

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive lg:col-span-2">{error}</p> : null}
      {message ? <p className="rounded-lg border bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300 lg:col-span-2">{message}</p> : null}
    </div>
  );
}
