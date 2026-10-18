import axios from "axios";
import Image from "next/image";
import { useState, type Dispatch, type SetStateAction } from "react";
import { errorMessage, useMe } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { reviewSchema, type ReviewInput } from "../utils/schemas";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Stars, { StarInput } from "./ui/Stars";
import { FieldError, Label, Select, Textarea } from "./ui/Field";
import type { Product, Review, ReviewSummary } from "@/types";

type SortMethod = "recent" | "rating";

interface ReviewsProps {
  reviews: Review[];
  ratingArray: ReviewSummary["ratingArray"];
  product: Product;
  setAskLogin: Dispatch<SetStateAction<boolean>>;
}

const ALL_RATINGS = [1, 2, 3, 4, 5];

export default function Reviews({
  reviews,
  ratingArray,
  product,
  setAskLogin,
}: ReviewsProps) {
  //used for star rating
  const starsLoop = [0, 1, 2, 3, 4];
  const { user } = useMe();
  const [ratingForm, setRatingForm] = useState<number | null>(null);
  const [errorRating, setErrorRating] = useState("");
  const [filter, setFilter] = useState(ALL_RATINGS);
  const [sort, setSort] = useState<SortMethod>("recent");
  const router = useRouter();
  // one review per product, the api rejects a second one with 409
  const alreadyReviewed =
    user !== null && reviews.some((review) => review.userId === user._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
  });

  const addReview = async (data: ReviewInput) => {
    if (!ratingForm) {
      setErrorRating("Select a star");
      return;
    }
    try {
      await axios.post(`/api/review/${product._id}`, {
        review: data.review,
        rating: ratingForm,
      });
      reset();
      setRatingForm(null);
      // rerun getServerSideProps so the new review shows up
      router.replace(router.asPath, undefined, { scroll: false });
    } catch (error) {
      setErrorRating(errorMessage(error));
    }
  };

  // "0" means all ratings
  const handleFilter = (value: string) => {
    setFilter(value === "0" ? ALL_RATINGS : [Number(value)]);
  };

  // percentage of reviews with this many stars
  const share = (stars: number) =>
    reviews.length > 0 ? ((ratingArray[stars] ?? 0) / reviews.length) * 100 : 0;

  // sort a copy, the reviews prop must not be mutated
  const sortedReviews = [...reviews].sort((a, b) =>
    sort === "rating"
      ? b.rating - a.rating
      : new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Card className="mt-3 flex flex-col p-5 md:px-10">
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-bold text-foreground">Customer reviews</h3>
        <p className="mb-3 text-muted-foreground">
          {reviews.length} global rating{reviews.length > 1 && "s"}
        </p>
        <div>
          <table>
            <tbody>
              {starsLoop.map((star, index) => (
                <tr
                  className="mb-2 flex cursor-pointer items-center transition-transform duration-200 ease-in-out hover:scale-[1.02]"
                  key={index}
                  onClick={() => handleFilter(`${star + 1}`)}
                >
                  <td className="w-15 text-link">{star + 1} star</td>
                  <td className="h-5.5 w-40 rounded-sm bg-muted">
                    <div
                      style={{ width: `${share(star + 1)}%` }}
                      className={`h-5 rounded-sm bg-star shadow-sm`}
                    ></div>
                  </td>
                  <td className="w-12.5 text-right text-link">
                    {Math.round(share(star + 1))}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <div className="mt-6 flex flex-col items-center gap-1 self-center">
          <Label htmlFor="sortBy">Sort by</Label>
          <Select
            id="sortBy"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMethod)}
            className="w-35"
          >
            <option value="recent">Most recent</option>
            <option value="rating">Rating</option>
          </Select>
        </div>
        <div className="mt-6 flex flex-col items-center gap-1 self-center">
          <Label htmlFor="filterBy">Filter by</Label>
          <Select
            id="filterBy"
            onChange={(e) => handleFilter(e.target.value)}
            className="w-35"
          >
            <option value="0">All rating</option>
            <option value="1">1 star</option>
            <option value="2">2 star</option>
            <option value="3">3 star</option>
            <option value="4">4 star</option>
            <option value="5">5 star</option>
          </Select>
        </div>
      </div>
      <div>
        {reviews.length > 0 ? (
          <div>
            {sortedReviews
              .filter((review) => filter.includes(review.rating))
              .map((review) => (
                <div
                  className="mt-8 border-b border-border pb-2"
                  key={review._id}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src="/images/user.svg"
                      width={40}
                      height={40}
                      alt="avatar"
                      unoptimized
                    />{" "}
                    <p className="text-xl">{review.reviewAuthor}</p>
                  </div>
                  <Stars rating={review.rating} size="sm" className="my-2" />
                  <p className="mb-2 text-sm">
                    Reviewed on {review.date_formatted}
                  </p>
                  <p>{review.text}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="pt-5 text-center">No reviews for this product</p>
        )}
      </div>
      {alreadyReviewed ? (
        <p className="pt-5 text-center text-muted-foreground">
          You reviewed this product
        </p>
      ) : user ? (
        <div>
          <h4 className="my-3 font-semibold text-foreground">Leave a review</h4>
          <div className="flex flex-col items-center gap-2">
            <StarInput
              value={ratingForm}
              onChange={(rating) => {
                setErrorRating("");
                setRatingForm(rating);
              }}
            />
            <FieldError message={errorRating} />
          </div>
          <div>
            <form
              className="mt-2 flex flex-col items-center"
              onSubmit={handleSubmit(addReview)}
            >
              <Textarea
                className="h-24"
                id="text"
                aria-label="Your review"
                aria-invalid={Boolean(errors.review)}
                {...register("review")}
              />
              <FieldError message={errors.review?.message} />
              <Button type="submit" className="mt-2">
                Add review
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="mt-5 self-center"
          onClick={() => setAskLogin(true)}
        >
          Write a review
        </Button>
      )}
    </Card>
  );
}
