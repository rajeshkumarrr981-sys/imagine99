"use client";
import React from "react";
import EmptyState from "../Diwali/EmptyState";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  if (wishlistItems.length === 0) {
    return (
      <>
        <Breadcrumb title={"Your wishlist"} pages={["Wishlist"]} />
        <EmptyState
          title="No saved gifts yet"
          text="Tap the heart on any product to keep it here for later."
          action={{ label: "Browse the shop", href: "/shop-with-sidebar" }}
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Your wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-ivory">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button className="text-blue">Clear Wishlist Cart</button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
