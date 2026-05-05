
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface InventoryVariant {
  id: number;
  product: number;
  product_name: string;
  product_description: string;
  category_name: string;
  price: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: number;
  category_name: string;
  variants: InventoryVariant[];
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

export interface SaleItem {
  id: number;
  variant_id: number;
  product_name: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  returned_quantity: number;
}

export interface SaleReturnItem {
  id: number;
  sale_item_id: number;
  variant_id: number;
  product_name: string;
  color: string | null;
  size: string | null;
  quantity: number;
  refund_amount: string;
  created_at: string;
}

export interface SaleReturn {
  id: number;
  idempotency_key: string | null;
  reason: string;
  refund_amount: string;
  items: SaleReturnItem[];
  created_at: string;
}

export interface Sale {
  id: number;
  customer: Customer | null;
  seller: string | null;
  total_price: string;
  status: "pending" | "completed" | "canceled" | "returned";
  inventory_applied: boolean;
  items: SaleItem[];
  returns: SaleReturn[];
  returned_total: string;
  net_total: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  variant: number;
  product_name: string;
  color: string | null;
  size: string | null;
  sale: number | null;
  sale_item: number | null;
  movement_type: "sale" | "cancel" | "return" | "restock" | "adjustment";
  quantity_change: number;
  note: string;
  created_at: string;
}

export interface DraftStockVariant {
  id: string;
  color: string;
  size: string;
  price: string;
  quantity: string;
}

export interface DraftStockProduct {
  id: string;
  name: string;
  description: string;
  variants: DraftStockVariant[];
}

export interface StockFormState {
  categoryName: string;
  products: DraftStockProduct[];
  addProduct: () => void;
  updateProduct: (id: string, field: keyof Omit<DraftStockProduct, "id" | "variants">, value: string) => void;
  deleteProduct: (id: string) => void;
  addVariant: (productId: string) => void;
  updateVariant: (productId: string, variantId: string, field: keyof Omit<DraftStockVariant, "id">, value: string) => void;
  deleteVariant: (productId: string, variantId: string) => void;
  resetStockForm: () => void;
  setName: (value: string) => void;
}

export interface DraftSaleItem {
  id: string;
  variantId: string;
  quantity: string;
  color: string,
  size: string,
  unitPrice: string;
}

export interface SaleDraftState {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  seller: string;
  items: DraftSaleItem[];
  setCustomerField: (field: "customerName" | "customerPhone" | "customerAddress" | "seller", value: string) => void;
  addItem: () => void;
  updateItem: (id: string, field: keyof Omit<DraftSaleItem, "id">, value: string) => void;
  removeItem: (id: string) => void;
  resetSaleDraft: () => void;
}
