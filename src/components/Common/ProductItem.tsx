"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Product } from "@/types/product";
import Stars from "@/components/Common/Stars";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { money } from "@/lib/pricing";

const icon = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Product card used across the store. */
const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const inWishlist = useAppSelector((s) => s.wishlistReducer.items.some((i) => i.id === item.id));

  const href = `/shop-details/${item.id}`;
  const inStock = item.stock > 0;
  const discount = item.price > item.discountedPrice ? Math.round((1 - item.discountedPrice / item.price) * 100) : 0;

  const addToCart = () => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
    toast.success("Added to cart");
  };

  const addToWishlist = () => {
    dispatch(addItemToWishlist({ ...item, quantity: 1, status: inStock ? "available" : "out of stock" }));
    toast.success("Saved to wishlist");
  };

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-2xl bg-gray-2 border border-transparent ease-out duration-300 group-hover:border-brass/50">
        <Link href={href} className="relative block aspect-[4/4.4]" aria-label={item.title}>
          {item.imgs.previews[0] && (
            <Image
              src={item.imgs.previews[0]}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover ease-out duration-500 group-hover:scale-[1.04]"
            />
          )}
        </Link>

        {discount > 0 && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-marigold-soft text-dark px-2.5 py-0.5 text-[11px] font-medium tracking-wide">
            −{discount}%
          </span>
        )}
        {!inStock && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-dark text-ivory px-2.5 py-0.5 text-[11px] font-medium">Sold out</span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:translate-x-2 ease-out duration-300 group-hover:opacity-100 group-hover:translate-x-0 focus-within:opacity-100 focus-within:translate-x-0">
          <button
            onClick={() => {
              dispatch(updateQuickView({ ...item }));
              openModal();
            }}
            aria-label={`Quick view ${item.title}`}
            className="w-9 h-9 rounded-full bg-ivory text-dark shadow-1 flex items-center justify-center hover:text-blue ease-out duration-200"
          >
            <svg {...icon}>
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="2.8" />
            </svg>
          </button>
          <button
            onClick={addToWishlist}
            disabled={inWishlist}
            aria-label={inWishlist ? "In wishlist" : `Save ${item.title} to wishlist`}
            className={`w-9 h-9 rounded-full bg-ivory shadow-1 flex items-center justify-center ease-out duration-200 ${inWishlist ? "text-blue" : "text-dark hover:text-blue"}`}
          >
            <svg {...icon} fill={inWishlist ? "currentColor" : "none"}>
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
            </svg>
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 lg:translate-y-[calc(100%+12px)] ease-out duration-300 group-hover:translate-y-0 focus-within:translate-y-0">
          <button
            onClick={addToCart}
            disabled={!inStock}
            className="w-full rounded-full bg-dark py-2.5 text-custom-sm font-medium text-ivory ease-out duration-200 hover:bg-blue disabled:bg-dark-4 disabled:cursor-not-allowed"
          >
            {inStock ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>

      <div className="pt-4 px-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-dark-4">{item.category}</p>
        <h3 className="mt-1.5 font-medium text-dark leading-snug line-clamp-2 ease-out duration-200 hover:text-blue">
          <Link href={href}>{item.title}</Link>
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={item.rating} size={12} />
          <span className="text-custom-xs text-dark-4">({item.reviews})</span>
        </div>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-[19px] text-blue">{money(item.discountedPrice)}</span>
          {discount > 0 && <span className="text-custom-sm text-dark-4 line-through">{money(item.price)}</span>}
        </p>
      </div>
    </article>
  );
};

export default ProductItem;
