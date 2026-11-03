import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/Diwali/SectionHeading";

type Category = { name: string; count: number; image?: string };

const Categories = ({ categories }: { categories: Category[] }) => {
  if (categories.length === 0) return null;
  return (
    <section className="pt-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <SectionHeading eyebrow="Browse" title="Shop by category" action={{ label: "All products", href: "/shop-with-sidebar" }} />
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
          {categories.map((c) => (
            <li key={c.name}>
              <Link href={`/shop-with-sidebar?category=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center text-center">
                <span className="relative block w-[132px] h-[132px] rounded-full overflow-hidden bg-gray-2 ring-1 ring-gray-3 ring-offset-4 ring-offset-ivory ease-out duration-300 group-hover:ring-brass">
                  {c.image && (
                    <Image src={c.image} alt="" fill sizes="132px" className="object-cover ease-out duration-500 group-hover:scale-105" />
                  )}
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
