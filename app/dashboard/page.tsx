import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  History,
  Home,
  PackagePlus,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

import { PageHeader } from "@/components/data-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { href: "/", title: "Available Stocks", text: "See stock cards with price, size, color, and status.", icon: Home },
  { href: "/sales/create", title: "Create Sale", text: "Build a pending sale from available variants.", icon: ShoppingCart },
  { href: "/inventory", title: "Inventory", text: "Review stock and low-stock warnings.", icon: Boxes },
  { href: "/stock/create", title: "Create Stock", text: "Register categories, products, and variants in one workflow.", icon: PackagePlus },
  { href: "/products/create", title: "Create Product", text: "Add a product and attach stock variants.", icon: PackagePlus },
  { href: "/sales/pending", title: "Pending Sales", text: "Complete sales when payment is confirmed.", icon: ReceiptText },
  { href: "/sales/completed", title: "Completed Sales", text: "Review completed sales and process returns.", icon: CheckCircle2 },
  { href: "/history", title: "History", text: "Audit stock movement records.", icon: History },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Use this page as the main workspace for inventory, stock, sales, and history." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full rounded-lg transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <Icon className="size-5 text-primary" />
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.text}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
