import Link from "next/link";
import Image from "next/image";
import { catalogs } from "../utils/catalogs";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

export default function Home() {
  const slideImages = [
    {
      image: "/images/shoes-slide.jpg",
      link: "/category/clothes/Shoes",
      caption: ["Shoes.", "They're never enough"],
      position: "center",
    },
    {
      image: "/images/phones-slide.jpg",
      link: "/category/electronics/Phones",
      caption: ["Check new deals", "on phones"],
      position: "center 70%",
    },
    {
      image: "/images/pets-slide.jpg",
      link: "/category/petsSupplies",
      caption: ["Find a gift", "for your pets"],
      position: "center 40%",
    },
  ];

  const properties = {
    duration: 3000,
    prevArrow: (
      <button>
        <IoIosArrowBack className="ml-2 border-none text-3xl text-white" />
      </button>
    ),
    nextArrow: (
      <button>
        <IoIosArrowForward className="mr-2 border-none text-3xl text-white" />
      </button>
    ),
  };

  return (
    <>
      <div className="slide-container">
        <Slide {...properties}>
          {slideImages.map((slideImage, index) => (
            <div className="each-slide" key={index}>
              <Link href={slideImage.link}>
                <div className="relative h-62.5 w-full md:h-87.5 lg:h-100 xl:h-137.5 3xl:h-175">
                  <Image
                    src={slideImage.image}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    style={{ objectPosition: slideImage.position }}
                    alt={slideImage.caption.join(" ")}
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 via-black/10 to-transparent">
                    <h2 className="p-5 font-serif text-2xl font-bold text-white drop-shadow-lg md:p-10 md:text-4xl lg:px-16 lg:text-5xl">
                      {slideImage.caption[0]}
                      <br />
                      {slideImage.caption[1]}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slide>
      </div>
      <Container className="flex flex-wrap justify-center py-4">
        {catalogs.map((catalog, index) => {
          return (
            <Card
              key={index}
              className="m-3 max-w-xs p-3 transition-shadow duration-300 hover:shadow-lg"
            >
              <Link href={catalog.link}>
                <h2 className="pb-2 text-lg font-bold">{catalog.name}</h2>
                <Image
                  src={catalog.image}
                  width={400}
                  height={267}
                  sizes="320px"
                  className="aspect-3/2 w-full rounded-md object-cover"
                  alt={catalog.name}
                />
                <p className="text-muted-foreground">See more...</p>
              </Link>
            </Card>
          );
        })}
      </Container>
    </>
  );
}
