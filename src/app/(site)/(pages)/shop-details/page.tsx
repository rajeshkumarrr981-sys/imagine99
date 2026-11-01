import { redirect } from "next/navigation";

// Product pages live at /shop-details/[id].
export default function ShopDetailsIndex() {
  redirect("/shop-with-sidebar");
}
