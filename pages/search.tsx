import ProductCard from "../components/ProductCard";
import Container from "../components/ui/Container";
import { searchProducts } from "../lib/products";
import type { GetServerSideProps } from "next";
import type { ProductWithRating } from "@/types";

interface SearchProps {
  query: string;
  productsAndAverage: ProductWithRating[];
}

export default function Search({ query, productsAndAverage }: SearchProps) {
  return (
    <Container className="py-5">
      <h2 className="text-xl font-bold">Search Result</h2>
      <p className="text-sm">
        {productsAndAverage.length} product
        {productsAndAverage.length !== 1 && "s"} found for &quot;{query}&quot;
      </p>
      {productsAndAverage.map(({ product, reviewAverage }) => {
        return (
          <ProductCard
            key={product._id}
            product={product}
            reviewAverage={reviewAverage}
          />
        );
      })}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async (
  context,
) => {
  const query =
    typeof context.query.q === "string" ? context.query.q.trim() : "";
  if (!query) {
    return { props: { query, productsAndAverage: [] } };
  }

  const productsAndAverage = await searchProducts(query);

  return {
    props: {
      query,
      productsAndAverage: JSON.parse(JSON.stringify(productsAndAverage)),
    },
  };
};
