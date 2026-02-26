import TextType from "@/components/TextType";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UnderlinedText from "@/components/UnderlinedText";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto flex justify-center px-4">
      <div className="w-full">
        <Card className="border-none shadow-none w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="max-w-3xl mx-auto text-5xl lg:text-6xl font-bold text-center leading-tight">
                A <UnderlinedText>better</UnderlinedText> way to find the{" "} <br className="max-lg:hidden"/>
                <TextType
                  className="text-accent"
                  text={["right ", "better", "best"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={false}
                  deletingSpeed={50}
                  variableSpeed={{ min: 60, max: 120 }}
                />{" "}
                <br className="sm:hidden" />
                place.
              </h1>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center text-xl mt-4">
              Search, compare and find the best fit.
            </CardDescription>
            <CardContent className="flex flex-col items-center gap-4 mt-8">
              <Link href="/register">
                <Button className="bg-accent text-lg has-[>svg]:p-6 cursor-pointer">
                  Start for free <ArrowRightIcon />
                </Button>
              </Link>
              <CardDescription className="text-sm">
                Free forever. No credit card required.
              </CardDescription>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
