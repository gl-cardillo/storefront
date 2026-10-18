import Link from "next/link";
import { BsCart2 } from "react-icons/bs";
import { AiOutlineUser } from "react-icons/ai";
import { useMe } from "../hooks/useAuth";
import Container from "./ui/Container";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user } = useMe();
  const cartQuantity = user
    ? user.cart.reduce((accum, cart) => accum + cart.quantity, 0)
    : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      {/* phones wrap the search onto its own row, wider screens center it in a grid */}
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 md:grid md:h-16 md:grid-cols-[1fr_minmax(0,28rem)_1fr] md:py-0">
        <Link href="/" className="justify-self-start">
          <Logo className="h-9 w-auto" />
        </Link>
        <SearchBox className="order-last w-full md:order-0" />
        <nav
          aria-label="Account"
          className="ml-auto flex items-center gap-4 md:justify-self-end"
        >
          <ThemeToggle />
          <Link
            href={user ? "/profile" : "/signin"}
            aria-label={user ? "Account" : "Sign in"}
          >
            <AiOutlineUser className="text-2xl text-foreground" />
          </Link>
          <div className="relative">
            <Link
              href="/cart"
              aria-label={
                cartQuantity > 0 ? `Cart, ${cartQuantity} items` : "Cart"
              }
            >
              <BsCart2 className="text-2xl text-foreground" />
            </Link>
            {cartQuantity > 0 && (
              <p
                aria-hidden="true"
                className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
              >
                {cartQuantity}
              </p>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
