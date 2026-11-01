import Link from "next/link";
import Diya from "./Diya";

type Props = { title: string; text: string; action?: { label: string; href: string; onClick?: () => void } };

/** Friendly empty state with a small diya. */
export default function EmptyState({ title, text, action }: Props) {
  return (
    <div className="max-w-[440px] mx-auto text-center py-16 px-4">
      <Diya size={64} className="mx-auto" />
      <h2 className="mt-6 text-[28px] leading-tight text-dark">{title}</h2>
      <p className="mt-2 text-dark-4">{text}</p>
      {action && (
        <Link
          href={action.href}
          onClick={action.onClick}
          className="mt-7 inline-flex rounded-full bg-blue px-7 py-3 font-medium text-white ease-out duration-200 hover:bg-blue-dark"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
