import { useState, type Dispatch, type SetStateAction } from "react";
import { BsChatSquareText } from "react-icons/bs";
import { useMe } from "../hooks/useAuth";
import { cn } from "../utils/cn";
import ReviewForm from "./ReviewForm";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import Stars from "./ui/Stars";
import { Label, Select } from "./ui/Field";
import type { Product, Review, ReviewSummary } from "@/types";

type SortMethod = "recent" | "rating";

interface ReviewsProps {
  reviews: Review[];
  ratingArray: ReviewSummary["ratingArray"];
  ratingAverage: number;
  product: Product;
  setAskLogin: Dispatch<SetStateAction<boolean>>;
}

const STARS_DESC = [5, 4, 3, 2, 1];

export default function Reviews({
  reviews,
  ratingArray,
  ratingAverage,
  product,
  setAskLogin,
}: ReviewsProps) {
  const { user } = useMe();
  // 0 means every rating
  const [filter, setFilter] = useState(0);
  const [sort, setSort] = useState<SortMethod>("recent");
  const count = reviews.length;
  // one review per product, the api rejects a second one with 409
  const alreadyReviewed =
    user !== null && reviews.some((review) => review.userId === user._id);

  // percentage of reviews with this many stars
  const share = (stars: number) =>
    count > 0 ? ((ratingArray[stars] ?? 0) / count) * 100 : 0;

  // sort a copy, the reviews prop must not be mutated
  const shownReviews = [...reviews]
    .filter((review) => filter === 0 || review.rating === filter)
    .sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="mt-14 scroll-mt-24"
    >
      <h2 id="reviews-title" className="text-2xl font-bold">
        Customer reviews
      </h2>
      <div className="mt-6 grid gap-8 md:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            {count > 0 ? (
              <>
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">out of 5</span>
                </p>
                <Stars rating={ratingAverage} className="mt-1" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {count} review{count !== 1 && "s"}
                </p>
              </>
            ) : (
              <p className="font-medium">No reviews yet</p>
            )}
            {/* each bar filters the list to that star count */}
            <ul className="mt-4 space-y-1.5">
              {STARS_DESC.map((stars) => (
                <li key={stars}>
                  <button
                    type="button"
                    aria-pressed={filter === stars}
                    disabled={count === 0}
                    onClick={() => setFilter(filter === stars ? 0 : stars)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-1 py-0.5 text-sm enabled:hover:bg-muted",
                      filter === stars && "bg-muted",
                    )}
                  >
                    <span className="w-12 text-left">
                      {stars} star
                      <span className="sr-only"> reviews,</span>
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-star"
                        style={{ width: `${share(stars)}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-muted-foreground">
                      {Math.round(share(stars))}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          {alreadyReviewed ? (
            <Card className="p-5 text-sm text-muted-foreground">
              You reviewed this product
            </Card>
          ) : user ? (
            <Card className="p-5">
              <ReviewForm productId={product._id} />
            </Card>
          ) : (
            <Card className="flex flex-col items-start gap-3 p-5">
              <h3 className="font-semibold">Share your thoughts</h3>
              <p className="text-sm text-muted-foreground">
                Tell other shoppers what you think of this product.
              </p>
              <Button onClick={() => setAskLogin(true)}>Write a review</Button>
            </Card>
          )}
        </div>
        <div>
          {count > 0 ? (
            <>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="sortBy">Sort by</Label>
                  <Select
                    id="sortBy"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortMethod)}
                    className="w-40"
                  >
                    <option value="recent">Most recent</option>
                    <option value="rating">Highest rating</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="filterBy">Filter by</Label>
                  <Select
                    id="filterBy"
                    value={filter}
                    onChange={(e) => setFilter(Number(e.target.value))}
                    className="w-40"
                  >
                    <option value={0}>All ratings</option>
                    {STARS_DESC.map((stars) => (
                      <option key={stars} value={stars}>
                        {stars} star{stars !== 1 && "s"}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {shownReviews.length > 0 ? (
                <ul className="mt-4 divide-y divide-border">
                  {shownReviews.map((review) => (
                    <li key={review._id} className="py-5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
                        >
                          {review.reviewAuthor.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{review.reviewAuthor}</p>
                          <p className="text-xs text-muted-foreground">
                            Reviewed on {review.date_formatted}
                          </p>
                        </div>
                      </div>
                      <Stars
                        rating={review.rating}
                        size="sm"
                        className="mt-3"
                      />
                      <p className="mt-2 text-sm">{review.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  No {filter} star reviews.{" "}
                  <button
                    type="button"
                    onClick={() => setFilter(0)}
                    className="text-link hover:underline"
                  >
                    Show all reviews
                  </button>
                </p>
              )}
            </>
          ) : (
            <EmptyState
              icon={BsChatSquareText}
              title="No reviews yet"
              description="Be the first to tell others what you think."
              className="py-8"
            />
          )}
        </div>
      </div>
    </section>
  );
}
