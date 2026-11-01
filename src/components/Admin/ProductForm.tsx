"use client";
import Link from "next/link";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { saveProduct, type ProductFormState, type ProductFormValues } from "@/app/(admin)/admin/actions";
import { adminInputClass, primaryButtonClass, secondaryButtonClass } from "./format";

type Props = {
  productId?: string;
  initial: ProductFormValues;
  categories: string[];
};

export default function ProductForm({ productId, initial, categories }: Props) {
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

  const field = (name: keyof ProductFormValues, label: string, input: ReactNode, hint?: string) => (
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
        <p className="mt-1.5 text-custom-xs text-dark-4">{hint}</p>
      ) : null}
    </div>
  );

  const inputProps = (name: keyof ProductFormValues) => ({
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
            "Selling price. Must be ≤ price."
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
          "One path per line, e.g. /images/products/product-1-bg-1.png. The first one is the main image."
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
          "One path per line. Leave empty to reuse the preview images."
        )}
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
