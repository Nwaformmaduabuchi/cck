import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  in_stock: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  low_stock: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  out_of_stock: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  canceled: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  returned: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium", styles[value] ?? "bg-muted text-muted-foreground")}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
