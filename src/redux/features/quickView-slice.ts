import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    id: "",
    title: "",
    description: "",
    category: "",
    price: 0,
    discountedPrice: 0,
    stock: 0,
    reviews: 0,
    rating: 0,
    imgs: { thumbnails: [], previews: [] },
  },
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
