"use client";
import React from "react";
import OrderSummary from "./OrderSummary";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import EmptyState from "../Diwali/EmptyState";
import Link from "next/link";

const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  return (
    <>
      {/* <!-- ===== Breadcrumb Section Start ===== --> */}
      <section>
        <Breadcrumb title={"Your cart"} pages={["Cart"]} />
      </section>
      {/* <!-- ===== Breadcrumb Section End ===== --> */}
      {cartItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Your Cart</h2>
              <button className="text-blue" onClick={() => dispatch(removeAllItemsFromCart())}>
                Clear Shopping Cart
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-7.5">
                    <div className="min-w-[400px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[180px]">
                      <p className="text-dark">Price</p>
                    </div>

                    <div className="min-w-[275px]">
                      <p className="text-dark">Quantity</p>
                    </div>

                    <div className="min-w-[200px]">
                      <p className="text-dark">Subtotal</p>
                    </div>

                    <div className="min-w-[50px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* <!-- cart item --> */}
                  {cartItems.length > 0 &&
                    cartItems.map((item, key) => (
                      <SingleItem item={item} key={key} />
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 mt-9">
              <OrderSummary />
            </div>
          </div>
        </section>
      ) : (
        <>
          <EmptyState
            title="Your cart is waiting"
            text="Nothing here yet. Find something that will light up someone's Diwali."
            action={{ label: "Browse the shop", href: "/shop-with-sidebar" }}
          />
        </>
      )}
    </>
  );
};

export default Cart;
