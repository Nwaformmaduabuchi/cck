"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  History,
  Home,
  Info,
  LayoutDashboard,
  Menu,
  PackagePlus,
  ReceiptText,
  ShoppingCart,
  X,
} from "lucide-react";

import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/stock/create", label: "Create Stock", icon: PackagePlus },
  { href: "/products/create", label: "Create Product", icon: PackagePlus },
  { href: "/sales/create", label: "Create Sale", icon: ShoppingCart },
  { href: "/sales/pending", label: "Pending Sales", icon: ReceiptText },
  { href: "/sales/completed", label: "Completed Sales", icon: CheckCircle2 },
  { href: "/history", label: "History", icon: History },
  { href: "/about", label: "About", icon: Info },
];

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/sales/create", label: "Create Sale" },
  { href: "/history", label: "History" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showDashboardLink = pathname !== "/dashboard";
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-normal">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg border bg-background">
                <Image src="/favicon.ico" alt="" width={28} height={28} className="size-7" />
              </span>
              CCK Inventory
            </Link>
            <div className="flex items-center gap-2">
              {showDashboardLink ? (
                <Button asChild className="hidden md:inline-flex">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : null}
              <ThemeToggle />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
          <nav
            className={cn(
              "grid gap-1 overflow-hidden transition-[grid-template-rows,margin] md:hidden",
              isMenuOpen ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="min-h-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg border bg-background">
              <Image src="/favicon.ico" alt="" width={24} height={24} className="size-6" />
            </span>
            CCK Inventory
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-sm text-muted-foreground md:text-right">
            <p>© {currentYear} CCK Inventory</p>
            <p>Powered by Reavix Technologies .inc</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
