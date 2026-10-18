import Link from "next/link";
import Container from "./ui/Container";
import Logo from "./Logo";
import { catalogs } from "../utils/catalogs";

const REPO_URL = "https://github.com/gl-cardillo/amazon-clone";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <Logo className="h-8 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A portfolio demo built with Next.js, TypeScript, Tailwind and
            MongoDB. Nothing here is for sale.
          </p>
        </div>
        <nav aria-label="Categories">
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {catalogs.map((catalog) => (
              <li key={catalog.id}>
                {/* no prefetch, or every short page would load all categories */}
                <Link
                  href={catalog.link}
                  prefetch={false}
                  className="hover:text-foreground"
                >
                  {catalog.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Project">
          <h2 className="text-sm font-semibold">Project</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={REPO_URL} className="hover:text-foreground">
                Source code
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}/blob/main/IMAGE_CREDITS.md`}
                className="hover:text-foreground"
              >
                Image credits
              </a>
            </li>
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-border py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Storefront
      </Container>
    </footer>
  );
}
