import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import Countdown from "./Countdown";
import PriceTiers from "./PriceTiers";
import BestSeller from "./BestSeller";
import Testimonials, { type HomeReview } from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { Product } from "@/types/product";

type Props = {
  featured?: Product;
  newArrivals: Product[];
  bestSellers: Product[];
  categories: { name: string; count: number; image?: string }[];
  tierCounts: Record<number, number>;
  reviews: HomeReview[];
};

const Home = ({ featured, newArrivals, bestSellers, categories, tierCounts, reviews }: Props) => {
  return (
    <main>
      <Hero featured={featured} />
      <PriceTiers counts={tierCounts} />
      <Categories categories={categories} />
      <NewArrival products={newArrivals} />
      <Countdown />
      <BestSeller products={bestSellers} />
      <Testimonials reviews={reviews} />
      <Newsletter />
    </main>
  );
};

export default Home;
