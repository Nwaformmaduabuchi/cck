import { PageHeader } from "@/components/data-state";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About" description="CCK Inventory keeps product stock, negotiated sales, and movement history aligned." />
      <Card className="max-w-3xl rounded-lg">
        <CardContent className="space-y-3 py-5 text-sm text-muted-foreground">
          <p>The system records pending sales first, then applies inventory exactly once when a sale is completed.</p>
          <p>Backend totals are calculated server-side so the frontend never becomes the source of truth for money or stock.</p>
        </CardContent>
      </Card>
    </>
  );
}
