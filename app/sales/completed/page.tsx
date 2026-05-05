import { EmptyState, PageHeader } from "@/components/data-state";
import { CompletedSalesWorkspace } from "@/components/completed-sales-workspace";
import { getCompletedSales } from "@/lib/query";

export default async function CompletedSalesPage() {
  const sales = await getCompletedSales().catch(() => []);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Completed Sales"
        description=""
      />
      {sales.length === 0 ? (
        <EmptyState title="No completed sales" description="Completed sales will appear here after inventory is applied." />
      ) : (
        <CompletedSalesWorkspace initialSales={sales} />
      )}
    </section>
  );
}
