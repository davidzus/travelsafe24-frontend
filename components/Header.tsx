import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Header() {
  return (
    <section className="h-16 flex justify-between items-center px-4">
      {/* Logo */}
      <Link href="/">
        <div className="font-bold text-accent text-2xl cursor-pointer">
          TravelSafe24
        </div>
      </Link>
      {/* Navigation */}
      <Navbar />
    </section>
  );
}
