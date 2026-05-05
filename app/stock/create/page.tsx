import StockCreatForm from "@/components/ui/custom/StockCreateForm";
import { PageHeader } from "@/components/data-state";

export default function CreateStockPage() {
  return (
    <>
      <PageHeader title="Create Stock" description="Register a category with products and variants in one workflow." />
      <StockCreatForm />
    </>
  );
}
