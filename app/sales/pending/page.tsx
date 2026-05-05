import { PageHeader } from "@/components/data-state";
import { PendingSalesWorkspace } from "@/components/pending-sales-workspace";
import { getInventory, getPendingSales } from "@/lib/query";

export default async function PendingSalesPage() {
  const [sales, variants] = await Promise.all([
    getPendingSales().catch(() => []),
    getInventory().catch(() => []),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Pending Sales"
        description=""
      />
      <PendingSalesWorkspace initialSales={sales} variants={variants} />
    </section>
  );
}
