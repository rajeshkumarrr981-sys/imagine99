// Plain, serializable product shape passed from the server to UI components.
export type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountedPrice: number;
  stock: number;
  reviews: number; // review count
  rating: number; // average rating, 0-5
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
};
