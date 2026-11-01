import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/Diwali/SectionHeading";
import data from "./categoryData";

type Category = { name: string; count: number };

const imageFor = (name: string) => data.find((d) => d.title === name)?.img ?? "/images/categories/categories-01.png";

const Categories = ({ categories }: { categories: Category[] }) => {
  if (categories.length === 0) return null;
  return (
    <section className="pt-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <SectionHeading eyebrow="Browse" title="Shop by category" action={{ label: "All products", href: "/shop-with-sidebar" }} />
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
          {categories.map((c) => (
            <li key={c.name}>
              <Link href={`/shop-with-sidebar?category=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center text-center">
                <span className="relative flex items-center justify-center w-[132px] h-[132px] rounded-full bg-gray-2 border border-gray-3 ease-out duration-300 group-hover:border-brass group-hover:bg-marigold-wash">
                  <span className="absolute inset-2 rounded-full border border-dashed border-brass/0 ease-out duration-300 group-hover:border-brass/40" />
                  <Image src={imageFor(c.name)} alt="" width={78} height={78} className="ease-out duration-300 group-hover:scale-105" />
                </span>
                <span className="mt-4 font-medium text-dark ease-out duration-200 group-hover:text-blue">{c.name}</span>
                <span className="text-custom-xs text-dark-4">
                  {c.count} item{c.count === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Categories;
