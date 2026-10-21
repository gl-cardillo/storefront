import axios from "axios";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorMessage } from "../hooks/useAuth";
import { toast } from "../utils/toast";
import { reviewRequestSchema, type ReviewRequest } from "../utils/schemas";
import Button from "./ui/Button";
import { FieldError, Label, Textarea } from "./ui/Field";
import { StarInput } from "./ui/Stars";

// the rating is part of the form, so its error shows with the others
export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<ReviewRequest>({
    resolver: zodResolver(reviewRequestSchema),
  });
  const rating = useWatch({ control, name: "rating" });

  const addReview = async (data: ReviewRequest) => {
    try {
      await axios.post(`/api/review/${productId}`, data);
      // rerun getServerSideProps so the new review shows up
      await router.replace(router.asPath, undefined, { scroll: false });
      toast("Thanks for your review");
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  };

  return (
    <form
      aria-labelledby="review-form-title"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(addReview)}
    >
      <h3 id="review-form-title" className="font-semibold">
        Leave a review
      </h3>
      <FieldError message={errors.root?.message} />
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-semibold">Your rating</legend>
        <StarInput
          value={rating ?? null}
          onChange={(value) =>
            setValue("rating", value, { shouldValidate: isSubmitted })
          }
        />
        <FieldError message={errors.rating?.message} />
      </fieldset>
      <div className="flex flex-col gap-1">
        <Label htmlFor="review-text">Your review</Label>
        <Textarea
          id="review-text"
          className="h-28"
          aria-invalid={Boolean(errors.review)}
          {...register("review")}
        />
        <FieldError message={errors.review?.message} />
      </div>
      <Button type="submit" loading={isSubmitting} className="self-start">
        Add review
      </Button>
    </form>
  );
}
