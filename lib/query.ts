
import type { Category, InventoryVariant, Product, Sale, StockMovement } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.method ? "no-store" : "no-store",
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.detail ?? payload?.message ?? JSON.stringify(payload ?? {});
    throw new Error(message || "Request failed");
  }

  return payload as T;
}

export const getCategories = () => apiFetch<Category[]>("/stock/categories/");
export const getProducts = () => apiFetch<Product[]>("/stock/products/");
export const getInventory = () => apiFetch<InventoryVariant[]>("/stock/inventory/");
export const getPendingSales = () => apiFetch<Sale[]>("/sales/pending/");
export const getCompletedSales = () => apiFetch<Sale[]>("/sales/completed/");
export const getStockMovements = () => apiFetch<StockMovement[]>("/sales/stock-movements/");

export const createProduct = (payload: { name: string; description: string; category: number }) =>
  apiFetch<Product>("/stock/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createVariant = (payload: {
  product: number;
  color?: string;
  size?: string;
  price?: string | null;
  quantity: number;
}) =>
  apiFetch<InventoryVariant>("/stock/variants/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createSale = (payload: unknown) =>
  apiFetch<Sale>("/sales/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updatePendingSale = (saleId: number, payload: unknown) =>
  apiFetch<Sale>(`/sales/${saleId}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deletePendingSaleItem = (saleId: number, itemId: number) =>
  apiFetch<Sale>(`/sales/${saleId}/items/${itemId}/`, {
    method: "DELETE",
  });

export const completeSale = (saleId: number) =>
  apiFetch<Sale>(`/sales/${saleId}/complete/`, {
    method: "POST",
  });

export const returnSaleItems = (saleId: number, payload: unknown) =>
  apiFetch(`/sales/${saleId}/returns/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const formatMoney = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
