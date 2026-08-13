import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Cart, CartItem, Product } from "../types";

// ─── State shape ──────────────────────────────────────────────────────────────
interface CartState extends Cart {
  lastError: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR_ERROR" }
  | { type: "LOAD"; items: CartItem[] };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD":
      return { ...state, items: action.items, lastError: null };

    case "ADD_ITEM": {
      const { product, quantity = 1 } = action;

      if (product.stock <= 0) {
        return { ...state, lastError: "This product is out of stock." };
      }

      const existing = state.items.find((i) => i.productId === product.id);
      const currentQty = existing?.quantity ?? 0;

      if (currentQty + quantity > product.stock) {
        return {
          ...state,
          lastError: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available. You already have ${currentQty} in your cart.`,
        };
      }

      if (existing) {
        return {
          ...state,
          lastError: null,
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }

      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      };

      return { ...state, lastError: null, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        lastError: null,
        items: state.items.filter((i) => i.productId !== action.productId),
      };

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action;
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return state;

      if (quantity < 0) {
        return { ...state, lastError: "Quantity cannot be negative." };
      }
      if (quantity > item.stock) {
        return {
          ...state,
          lastError: `Only ${item.stock} unit${item.stock === 1 ? "" : "s"} available.`,
        };
      }
      if (quantity === 0) {
        return {
          ...state,
          lastError: null,
          items: state.items.filter((i) => i.productId !== productId),
        };
      }

      return {
        ...state,
        lastError: null,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [], lastError: null };

    case "CLEAR_ERROR":
      return { ...state, lastError: null };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastError: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  clearError: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ecommerce_cart_v1";

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    lastError: null,
  });

  // Load persisted cart on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      dispatch({ type: "LOAD", items: saved });
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    saveToStorage(state.items);
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = state.items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      dispatch({ type: "ADD_ITEM", product, quantity });
    },
    []
  );

  const removeItem = useCallback((productId: number) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalAmount,
        lastError: state.lastError,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
