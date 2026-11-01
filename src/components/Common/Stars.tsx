import Image from "next/image";

/** Five stars; stars above the rounded rating are faded. */
export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Image
          key={n}
          src="/images/icons/icon-star.svg"
          alt=""
          width={size}
          height={size}
          className={n <= filled ? "" : "opacity-25 grayscale"}
        />
      ))}
    </div>
  );
}
