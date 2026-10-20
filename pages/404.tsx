import Link from "next/link";
import Container from "../components/ui/Container";
import { catalogs } from "../utils/catalogs";

export default function Custom404() {
  return (
    <Container
      size="sm"
      className="flex flex-col items-center py-20 text-center"
    >
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Back to the home page
      </Link>
      <nav aria-label="Popular categories" className="mt-10">
        <p className="text-sm text-muted-foreground">Or browse a category</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {catalogs.slice(0, 4).map((catalog) => (
            <li key={catalog.id}>
              <Link
                href={catalog.link}
                prefetch={false}
                className="block rounded-full border border-border bg-surface px-4 py-1.5 text-sm hover:bg-muted"
              >
                {catalog.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
