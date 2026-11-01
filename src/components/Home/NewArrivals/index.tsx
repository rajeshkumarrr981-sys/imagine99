import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import SectionHeading from "@/components/Diwali/SectionHeading";
import { Product } from "@/types/product";

const NewArrival = ({ products }: { products: Product[] }) => {
  if (products.length === 0) return null;
  return (
    <section className="pt-24">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <SectionHeading eyebrow="Just in" title="New for the festive season" action={{ label: "View all", href: "/shop-with-sidebar" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-10">
          {products.map((item) => (
            <ProductItem item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
