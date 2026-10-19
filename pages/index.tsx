import Link from "next/link";
import Image from "next/image";
import { BsArrowRight } from "react-icons/bs";
import { catalogs } from "../utils/catalogs";
import { cn } from "../utils/cn";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import HeroCarousel, { type Slide } from "../components/HeroCarousel";

const SLIDES: Slide[] = [
  {
    image: "/images/shoes-slide.jpg",
    link: "/category/clothes/Shoes",
    title: "Shoes.",
    subtitle: "They're never enough",
    cta: "Shop shoes",
    position: "center",
  },
  {
    image: "/images/phones-slide.jpg",
    link: "/category/electronics/Phones",
    title: "New deals",
    subtitle: "on phones",
    cta: "See phones",
    position: "center 70%",
  },
  {
    image: "/images/pets-slide.jpg",
    link: "/category/petsSupplies",
    title: "Find a gift",
    subtitle: "for your pets",
    cta: "Shop pet supplies",
    position: "center 40%",
  },
];

export default function Home() {
  return (
    <>
      <Container className="pt-4 md:pt-6">
        <HeroCarousel slides={SLIDES} />
      </Container>
      <Container className="py-10">
        <h2 className="text-2xl font-bold">Shop by category</h2>
        {/* the first card spans two columns, so seven cards fill whole rows */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalogs.map((catalog, index) => (
            <Link
              key={catalog.id}
              href={catalog.link}
              className={cn("group", index === 0 && "sm:col-span-2")}
            >
              <Card className="h-full overflow-hidden transition-shadow duration-300 group-hover:shadow-lg">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={catalog.image}
                    fill
                    sizes={
                      index === 0
                        ? "(min-width: 640px) 50vw, 100vw"
                        : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    }
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    alt=""
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <h3 className="font-semibold">{catalog.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-link">
                    Shop now <BsArrowRight aria-hidden />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
