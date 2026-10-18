import { useRouter } from "next/router";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";

export default function Custom404() {
  const router = useRouter();
  return (
    <Container size="sm" className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-xl font-bold">Sorry page not found :(</h2>
      <Button size="lg" className="mt-5" onClick={() => router.push("/")}>
        Go back to home!
      </Button>
    </Container>
  );
}
