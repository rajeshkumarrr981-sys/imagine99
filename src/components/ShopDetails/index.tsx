"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Stars from "@/components/Common/Stars";
import RecentlyViewdItems from "./RecentlyViewd";
import ProductReviews, { type ReviewView } from "./ProductReviews";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Product } from "@/types/product";
import { FREE_SHIPPING_OVER, money } from "@/lib/pricing";

type Props = {
  product: Product;
  related: Product[];
  reviews: ReviewView[];
  signedIn: boolean;
  myReview?: { rating: number; comment: string };
};

const tabs = [
  { id: "description", title: "Description" },
  { id: "reviews", title: "Reviews" },
];

const ShopDetails = ({ product, related, reviews, signedIn, myReview }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const inWishlist = useAppSelector((s) => s.wishlistReducer.items.some((i) => i.id === product.id));
  const inCart = useAppSelector((s) => s.cartReducer.items.find((i) => i.id === product.id)?.quantity ?? 0);

  const inStock = product.stock > 0;
  const maxQty = Math.max(product.stock - inCart, 0);

  // The full-screen preview slider reads the product from the store.
  useEffect(() => {
    dispatch(updateproductDetails(product));
  }, [dispatch, product]);

  const handleAddToCart = () => {
    if (quantity > maxQty) {
      toast.error(maxQty === 0 ? "You already have all available stock in your cart" : `Only ${maxQty} more available`);
      return;
    }
    dispatch(addItemToCart({ ...product, quantity }));
    toast.success("Added to cart");
  };

  const handleWishlist = () => {
    dispatch(addItemToWishlist({ ...product, quantity: 1, status: inStock ? "available" : "out of stock" }));
    toast.success("Saved to wishlist");
  };

  const preview = product.imgs.previews[previewImg] ?? product.imgs.previews[0];

  return (
    <>
      <Breadcrumb title={product.category} pages={["Shop", product.category]} />

      <section className="overflow-hidden relative pb-20 pt-10 lg:pt-14">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* gallery */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-2xl bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <button
                  onClick={openPreviewModal}
                  aria-label="Open image preview"
                  className="gallery__Image w-11 h-11 rounded-full bg-ivory shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.14580 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581Z" />
                    <path d="M16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893Z" />
                  </svg>
                </button>
                {preview && <Image src={preview} alt={product.title} width={400} height={400} priority />}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {product.imgs.thumbnails.map((item, key) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    aria-label={`Show image ${key + 1}`}
                    className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-xl bg-gray-2 ease-out duration-200 border hover:border-brass ${
                      key === previewImg ? "border-brass" : "border-transparent"
                    }`}
                  >
                    <Image width={50} height={50} src={item} alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* details */}
            <div className="max-w-[539px] w-full">
              <span className="eyebrow inline-block mb-3">{product.category}</span>
              <h2 className="text-[32px] sm:text-[40px] leading-[1.1] text-dark mb-4">{product.title}</h2>

              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <Stars rating={product.rating} size={18} />
                  <span>
                    ({product.reviews} customer review{product.reviews === 1 ? "" : "s"})
                  </span>
                </div>
                <span className={inStock ? "text-green" : "text-red"}>
                  {inStock ? `In Stock (${product.stock})` : "Out of Stock"}
                </span>
              </div>

              <h3 className="font-medium text-custom-1 mb-4.5">
                <span className="font-display text-blue text-[28px] mr-3">{money(product.discountedPrice)}</span>
                {product.price > product.discountedPrice && (
                  <span className="line-through text-dark-4">{money(product.price)}</span>
                )}
              </h3>

              <p className="mb-7.5 text-[17px] leading-relaxed">{product.description}</p>

              <div className="flex flex-wrap items-center gap-4.5 pt-7.5 border-t border-gray-3">
                <div className="flex items-center rounded-full border border-gray-4 bg-white">
                  <button
                    aria-label="Decrease quantity"
                    className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(maxQty, 1)))}
                    disabled={quantity >= maxQty}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-full ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>

                <button
                  onClick={handleWishlist}
                  disabled={inWishlist}
                  className="inline-flex font-medium text-dark border border-gray-4 py-3 px-6 rounded-full ease-out duration-200 hover:text-white hover:bg-dark hover:border-transparent disabled:opacity-60"
                >
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              <ul className="mt-7 grid sm:grid-cols-2 gap-3 text-custom-sm text-dark-3">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-marigold" aria-hidden="true" />
                  Free shipping on orders over {money(FREE_SHIPPING_OVER)}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-marigold" aria-hidden="true" />
                  Pay with cash on delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                  activeTab === item.id ? "text-blue before:w-full" : "text-dark before:w-0"
                }`}
              >
                {item.title}
                {item.id === "reviews" && ` (${product.reviews})`}
              </button>
            ))}
          </div>

          <div className={`mt-10 rounded-xl bg-white shadow-1 p-4 sm:p-6 ${activeTab === "description" ? "block" : "hidden"}`}>
            <h2 className="font-medium text-2xl text-dark mb-5">Description</h2>
            <p className="whitespace-pre-line">{product.description || "No description yet."}</p>
          </div>

          <div className={activeTab === "reviews" ? "block" : "hidden"}>
            <ProductReviews productId={product.id} reviews={reviews} signedIn={signedIn} myReview={myReview} />
          </div>
        </div>
      </section>

      {related.length > 0 && <RecentlyViewdItems products={related} />}
    </>
  );
};

export default ShopDetails;
