import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: CartItem[];
};

const initialState: InitialState = {
  items: [],
};

// Never let quantity go above stock (when we know it) or below 1.
const clampQty = (qty: number, stock?: number) =>
  Math.max(1, typeof stock === "number" ? Math.min(qty, Math.max(stock, 1)) : qty);

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, stock } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = clampQty(existingItem.quantity + quantity, stock ?? existingItem.stock);
      } else {
        state.items.push({ id, title, price, quantity: clampQty(quantity, stock), discountedPrice, imgs, stock });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = clampQty(quantity, existingItem.stock);
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
    // Used to restore the cart saved in localStorage.
    replaceCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + item.discountedPrice * item.quantity, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  replaceCart,
} = cart.actions;
export default cart.reducer;
