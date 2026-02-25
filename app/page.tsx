import { Separator } from "@/components/ui/separator";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="h-24"></div>
      <Hero />
      <div className="h-24"></div>
      <Separator />
      <div className="h-24"></div>
      <Features />
      <div className="h-24"></div>
      <Footer />
    </>
  );
}
