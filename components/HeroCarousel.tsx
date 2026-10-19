import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { cn } from "../utils/cn";

export interface Slide {
  image: string;
  link: string;
  title: string;
  subtitle: string;
  cta: string;
  // css object-position, keeps the subject in frame when cropped
  position: string;
}

const INTERVAL_MS = 5000;

function scrollToSlide(track: HTMLDivElement, index: number, count: number) {
  const next = (index + count) % count;
  track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
}

const slideIndex = (track: HTMLDivElement) =>
  Math.round(track.scrollLeft / track.clientWidth);

// scroll-snap carousel, swipeable on touch screens
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  // hovering or focusing the carousel stops autoplay
  const [paused, setPaused] = useState(false);

  const goTo = (index: number) => {
    if (trackRef.current) scrollToSlide(trackRef.current, index, slides.length);
  };

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      const track = trackRef.current;
      if (track) scrollToSlide(track, slideIndex(track) + 1, slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        // the scroll position is the source of truth, so swiping moves the dots too
        onScroll={(e) => setCurrent(slideIndex(e.currentTarget))}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.link}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            // off-screen slides stay out of the tab order
            inert={index !== current}
            className="relative h-72 w-full shrink-0 snap-start md:h-96 xl:h-120"
          >
            <Image
              src={slide.image}
              fill
              sizes="(min-width: 1280px) 1232px, 100vw"
              className="object-cover"
              style={{ objectPosition: slide.position }}
              alt=""
              priority={index === 0}
            />
            <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 bg-linear-to-t from-black/70 via-black/20 to-transparent p-6 pb-12 md:p-12">
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                {slide.title}
              </h2>
              <p className="text-lg text-white/90 md:text-xl">
                {slide.subtitle}
              </p>
              <Link
                href={slide.link}
                className="mt-3 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary-hover"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(current - 1)}
        className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-2xl text-white hover:bg-black/60 md:block"
      >
        <IoIosArrowBack />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(current + 1)}
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-2xl text-white hover:bg-black/60 md:block"
      >
        <IoIosArrowForward />
      </button>
      <div className="absolute right-6 bottom-5 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.link}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current}
            onClick={() => goTo(index)}
            className={cn(
              "h-2.5 rounded-full transition-all",
              index === current ? "w-6 bg-white" : "w-2.5 bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}
