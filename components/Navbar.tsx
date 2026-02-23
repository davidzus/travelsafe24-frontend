import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const menu = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "Login",
    href: "/login",
  },
  {
    label: "Register",
    href: "/register",
  },
];

function MenuContent() {
  return (
    <nav className="flex max-md:flex-col gap-4 px-4 font-medium">
      {menu.map((item) => (
        <Link
          key={item.href}
          className="hover:text-foreground/90"
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileMenu() {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <Separator />
          <MenuContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

function DesktopMenu() {
  return (
    <>
      <MenuContent />
    </>
  );
}

export default function Navbar() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopMenu />
      </div>
      <div className="block md:hidden">
        <MobileMenu />
      </div>
    </>
  );
}
