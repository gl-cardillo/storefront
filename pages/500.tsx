import Link from "next/link";
import Container from "../components/ui/Container";

// shown when a page fails on the server, for example when the database is down
export default function Custom500() {
  return (
    <Container
      size="sm"
      className="flex flex-col items-center py-20 text-center"
    >
      <p className="text-6xl font-bold text-primary">500</p>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Back to the home page
      </Link>
    </Container>
  );
}
