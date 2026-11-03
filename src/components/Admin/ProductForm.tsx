"use client";
import Link from "next/link";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { saveProduct, type ProductFormState, type ProductFormValues } from "@/app/(admin)/admin/actions";
import { PRICE_TIERS, money } from "@/lib/pricing";
import { adminInputClass, primaryButtonClass, secondaryButtonClass } from "./format";

const TIER_HINT = `Store tiers: ${PRICE_TIERS.map((t) => money(t)).join(", ")}`;

type TextField = Exclude<keyof ProductFormValues, "bestseller" | "festive" | "visibility">;

type Props = {
  productId?: string;
  initial: ProductFormValues;
  categories: string[];
  /** Whether the product is currently hidden from the shop (edit page only). */
  hiddenNow?: boolean;
};

export default function ProductForm({ productId, initial, categories, hiddenNow }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct.bind(null, productId),
    {}
  );

  // Submit through a transition instead of <form action>, so React 19 doesn't
  // reset the fields when the server returns validation errors.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  const values = state.values ?? initial;
  const err = state.fieldErrors ?? {};

  const field = (name: keyof ProductFormValues, label: string, input: ReactNode, hint?: ReactNode) => (
    <div>
      <label htmlFor={name} className="block mb-2 font-medium text-dark">
        {label}
      </label>
      {input}
      {err[name] ? (
        <p id={`${name}-error`} className="mt-1.5 text-custom-sm text-red">
          {err[name]}
        </p>
      ) : hint ? (
        <div className="mt-1.5 text-custom-xs text-dark-4">{hint}</div>
      ) : null}
    </div>
  );

  const inputProps = (name: TextField) => ({
    id: name,
    name,
    defaultValue: values[name],
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${name}-error` : undefined,
    className: `${adminInputClass} ${err[name] ? "border-red" : ""}`,
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      {state.error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-light-6 text-red px-4 py-3 text-custom-sm">
          {state.error}
        </p>
      )}

      <div className="grid gap-5">
        {field("title", "Title", <input type="text" required maxLength={200} {...inputProps("title")} />)}

        {field(
          "description",
          "Description",
          <textarea rows={5} maxLength={5000} {...inputProps("description")} />
        )}

        {field(
          "category",
          "Category",
          <>
            <input type="text" required list="category-options" maxLength={100} {...inputProps("category")} />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>,
          "Pick an existing category or type a new one."
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          {field("price", "Price (₹)", <input type="number" min={0} step="0.01" required {...inputProps("price")} />)}
          {field(
            "discountedPrice",
            "Discounted price (₹)",
            <input type="number" min={0} step="0.01" required {...inputProps("discountedPrice")} />,
            <>
              <p>Selling price. Must be ≤ price.</p>
              <p>{TIER_HINT}</p>
            </>
          )}
          {field("stock", "Stock", <input type="number" min={0} step="1" required {...inputProps("stock")} />)}
        </div>

        {field(
          "previews",
          "Preview images",
          <textarea
            rows={4}
            placeholder="/images/products/product-1-bg-1.png"
            {...inputProps("previews")}
            className={`${inputProps("previews").className} font-mono text-custom-sm`}
          />,
          "One per line: a site path (e.g. /images/products/product-1-bg-1.png) or a full https:// image URL (e.g. https://cdn.shopify.com/...). The first one is the main image."
        )}

        {field(
          "thumbnails",
          "Thumbnail images (optional)",
          <textarea
            rows={4}
            placeholder="/images/products/product-1-sm-1.png"
            {...inputProps("thumbnails")}
            className={`${inputProps("thumbnails").className} font-mono text-custom-sm`}
          />,
          "One per line, site path or full https:// URL. Leave empty to reuse the preview images."
        )}

        <fieldset>
          <legend className="block mb-2 font-medium text-dark">Merchandising</legend>
          <div className="flex flex-wrap gap-x-7.5 gap-y-3">
            <label className="inline-flex items-center gap-2.5 cursor-pointer text-dark">
              <input
                type="checkbox"
                name="bestseller"
                value="true"
                defaultChecked={values.bestseller}
                className="w-4 h-4 accent-blue"
              />
              Best seller
            </label>
            <label className="inline-flex items-center gap-2.5 cursor-pointer text-dark">
              <input
                type="checkbox"
                name="festive"
                value="true"
                defaultChecked={values.festive}
                className="w-4 h-4 accent-blue"
              />
              Festive / Diwali pick
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="visibility" className="block mb-2 font-medium text-dark">
            Show in shop
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={values.visibility}
            className="rounded-md border border-gray-3 bg-gray-1 py-2.5 px-4 text-dark outline-none focus:border-blue"
          >
            <option value="auto">Automatic (product ranking decides)</option>
            <option value="show">Always show</option>
            <option value="hide">Always hide</option>
          </select>
          <p className="mt-1.5 text-custom-sm text-dark-4">
            {hiddenNow === undefined
              ? "The ranking hides weaker products to keep the shop attractive."
              : hiddenNow
                ? "Currently hidden from the shop. Hidden products can still be ordered from existing carts."
                : "Currently visible in the shop."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-7.5">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : productId ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className={secondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
