import { CreateSaleForm } from "@/components/create-sale-form";
import { EmptyState, PageHeader } from "@/components/data-state";
import { getInventory } from "@/lib/query";

export default async function CreateSalePage() {
  const variants = await getInventory().catch(() => []);

  return (
    <>
      <PageHeader title="Make a Sale" description="Create a Sale Draft." />
      {variants.length === 0 ? (
        <EmptyState title="No inventory available" description="Create products and stock variants before recording sales." />
      ) : (
        <CreateSaleForm variants={variants} />
      )}
    </>
  );
}
