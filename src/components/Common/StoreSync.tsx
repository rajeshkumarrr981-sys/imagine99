"use client";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { replaceCart } from "@/redux/features/cart-slice";
import { replaceWishlist, type WishListItem } from "@/redux/features/wishlist-slice";

const CART_KEY = "imagine99-cart";
const WISHLIST_KEY = "imagine99-wishlist";

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked or full; the cart still works for this visit
  }
}

/**
 * Keeps the cart in localStorage, and keeps the wishlist in localStorage for guests
 * or in the database for signed-in users (merging any guest items on sign-in).
 */
export default function StoreSync() {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSession();
  const cart = useAppSelector((s) => s.cartReducer.items);
  const wishlist = useAppSelector((s) => s.wishlistReducer.items);

  const cartLoaded = useRef(false);
  const wishlistReady = useRef(false);
  const lastSynced = useRef<string>("");

  // Restore cart once.
  useEffect(() => {
    dispatch(replaceCart(readLocal(CART_KEY)));
    cartLoaded.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (cartLoaded.current) writeLocal(CART_KEY, cart);
  }, [cart]);

  // Load wishlist whenever the auth state settles.
  useEffect(() => {
    if (status === "loading") return;
    wishlistReady.current = false;
    const guestItems = readLocal<WishListItem>(WISHLIST_KEY);

    if (status === "unauthenticated") {
      dispatch(replaceWishlist(guestItems));
      lastSynced.current = "";
      wishlistReady.current = true;
      return;
    }

    let cancelled = false;
    (async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok || cancelled) return;
      const { items } = (await res.json()) as { items: WishListItem[] };
      const merged = [...items, ...guestItems.filter((g) => !items.some((i) => i.id === g.id))];
      if (merged.length !== items.length) {
        await fetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: merged.map((i) => i.id) }),
        });
      }
      if (cancelled) return;
      writeLocal(WISHLIST_KEY, []); // guest items now live in the account
      lastSynced.current = merged.map((i) => i.id).join(",");
      dispatch(replaceWishlist(merged));
      wishlistReady.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [status, dispatch]);

  // Save wishlist changes.
  useEffect(() => {
    if (!wishlistReady.current) return;
    if (status === "unauthenticated") {
      writeLocal(WISHLIST_KEY, wishlist);
      return;
    }
    if (status !== "authenticated") return;
    const ids = wishlist.map((i) => i.id);
    const key = ids.join(",");
    if (key === lastSynced.current) return;
    lastSynced.current = key;
    fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    });
  }, [wishlist, status]);

  return null;
}
