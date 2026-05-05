import { PageHeader } from "@/components/data-state";
import { ProductCreateForm } from "@/components/product-create-form";
import { getCategories, getProducts } from "@/lib/query";

export default async function CreateProductPage() {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <>
      <PageHeader title="Create Product" description="Add a product to an existing category, then create stock variants for color, size, price, and quantity." />
      <ProductCreateForm categories={categories} products={products} />
    </>
  );
}
