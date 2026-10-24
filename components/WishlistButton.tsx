import { useState } from "react";
import { useRouter } from "next/router";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import ConfirmDialog from "./ui/ConfirmDialog";
import { useMe } from "../hooks/useAuth";
import { useToggleWishlist } from "../hooks/useWishlist";
import { cn } from "../utils/cn";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

// a toggle, aria-pressed tells screen readers whether the product is saved
export default function WishlistButton({
  productId,
  productName,
  className,
}: WishlistButtonProps) {
  const [askLogin, setAskLogin] = useState(false);
  const router = useRouter();
  const { user } = useMe();
  const toggle = useToggleWishlist();
  const saved = user?.wishlist.includes(productId) ?? false;

  const onClick = () => {
    if (!user) return setAskLogin(true);
    // one request at a time, a quick double click would race on the server
    if (toggle.isPending) return;
    toggle.mutate({ productId, saved });
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Save ${productName}`}
        aria-pressed={saved}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center rounded-full border border-border bg-surface text-lg transition-colors hover:bg-muted",
          saved ? "text-danger" : "text-foreground",
          className,
        )}
      >
        {saved ? <BsHeartFill aria-hidden /> : <BsHeart aria-hidden />}
      </button>
      {askLogin && (
        <ConfirmDialog
          open
          title="Sign in to continue"
          description="You need an account to save products to your wishlist."
          confirmLabel="Sign in"
          cancelLabel="Not now"
          confirmVariant="primary"
          onConfirm={() => router.push("/signin")}
          onCancel={() => setAskLogin(false)}
        />
      )}
    </>
  );
}
