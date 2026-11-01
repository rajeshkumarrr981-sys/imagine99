import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WishListItem = {
  id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  stock?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: WishListItem[];
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      if (state.items.some((item) => item.id === action.payload.id)) return;
      state.items.push({ ...action.payload, quantity: 1 });
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
    replaceWishlist: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addItemToWishlist, removeItemFromWishlist, removeAllItemsFromWishlist, replaceWishlist } =
  wishlist.actions;
export default wishlist.reducer;
