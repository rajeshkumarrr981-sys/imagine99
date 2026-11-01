import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import Countdown from "./Countdown";
import GiftsByBudget from "./GiftsByBudget";
import BestSeller from "./BestSeller";
import Testimonials, { type HomeReview } from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { Product } from "@/types/product";

type Props = {
  newArrivals: Product[];
  bestSellers: Product[];
  categories: { name: string; count: number }[];
  reviews: HomeReview[];
};

const Home = ({ newArrivals, bestSellers, categories, reviews }: Props) => {
  return (
    <main>
      <Hero featured={bestSellers[0] ?? newArrivals[0]} />
      <Categories categories={categories} />
      <NewArrival products={newArrivals} />
      <Countdown />
      <BestSeller products={bestSellers} />
      <GiftsByBudget />
      <Testimonials reviews={reviews} />
      <Newsletter />
    </main>
  );
};

export default Home;
