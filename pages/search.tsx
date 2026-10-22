import { BsSearch } from "react-icons/bs";
import ProductListing from "../components/ProductListing";
import EmptyState from "../components/ui/EmptyState";
import Container from "../components/ui/Container";
import { searchProducts } from "../lib/products";
import type { GetServerSideProps } from "next";
import type { ProductWithRating } from "@/types";

interface SearchProps {
  query: string;
  productsAndAverage: ProductWithRating[];
}

export default function Search({ query, productsAndAverage }: SearchProps) {
  const count = productsAndAverage.length;

  return (
    <Container className="py-6">
      <h1 className="text-2xl font-bold md:text-3xl">
        {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
      </h1>
      {count > 0 ? (
        <ProductListing
          products={productsAndAverage}
          gridClassName="lg:grid-cols-4"
        />
      ) : (
        <EmptyState
          icon={BsSearch}
          title={query ? "No products found" : "Search the store"}
          description={
            query
              ? "Check the spelling or try a shorter search, like a brand or a product type."
              : "Type a product name, brand or type in the search box above."
          }
        />
      )}
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
