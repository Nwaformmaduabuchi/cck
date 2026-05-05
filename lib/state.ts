import { create } from "zustand";
import type { SaleDraftState, StockFormState } from "./types";

const createEmptyVariant = () => {
  return {
    id: crypto.randomUUID(),
    color: "",
    size: "",
    price: "",
    quantity: "",
  };
};

const createEmptyProduct = () => {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    variants: [createEmptyVariant()],
  };
};

const createEmptySaleItem = () => ({
  id: crypto.randomUUID(),
  variantId: "",
  color: "",
  size: "",
  quantity: "1",
  unitPrice: "",
});

export const useStockForm = create<StockFormState>()((set) => ({
  categoryName: "",
  products: [],

  setName: (value) => set({ categoryName: value }),

  addProduct: () =>
    set((state) => ({
      products: [...state.products, createEmptyProduct()],
    })),

  updateProduct: (id, field, value) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id == id
          ? {
              ...product,
              [field]: value,
            }
          : product
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),

  addVariant: (productId) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: [...product.variants, createEmptyVariant()],
            }
          : product
      ),
    })),

  updateVariant: (productId, variantId, field, value) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId
                  ? {
                      ...variant,
                      [field]: value,
                    }
                  : variant
              ),
            }
          : product
      ),
    })),

  deleteVariant: (productId, variantId) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.filter(
                (variant) => variant.id !== variantId
              ),
            }
          : product
      ),
    })),

  resetStockForm: () =>
    set({
      categoryName: "",
      products: [createEmptyProduct()],
    }),
}));

export const useSaleDraft = create<SaleDraftState>()((set) => ({
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  seller: "",
  items: [createEmptySaleItem()],

  setCustomerField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  addItem: () =>
    set((state) => ({
      items: [...state.items, createEmptySaleItem()],
    })),

  updateItem: (id, field, value) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items:
        state.items.length === 1
          ? state.items
          : state.items.filter((item) => item.id !== id),
    })),

  resetSaleDraft: () =>
    set({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      seller: "",
      items: [createEmptySaleItem()],
    }),
}));
