import { createSlice } from "@reduxjs/toolkit";
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

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
