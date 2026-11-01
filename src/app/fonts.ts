import { Fraunces } from "next/font/google";

// Display serif for headings. Body text stays Euclid Circular A.
export const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});
