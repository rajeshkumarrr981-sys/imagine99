"use client";
import React from "react";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import EmptyState from "@/components/Diwali/EmptyState";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();
  return (
    <EmptyState
      title="Your cart is waiting"
      text="Nothing here yet. Find something that will light up someone's Diwali."
      action={{ label: "Browse the shop", href: "/shop-with-sidebar", onClick: closeCartModal }}
    />
  );
};

export default EmptyCart;
