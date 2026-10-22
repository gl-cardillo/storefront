import { BsBoxSeam } from "react-icons/bs";
import ProductListing from "../../../components/ProductListing";
import EmptyState from "../../../components/ui/EmptyState";
import { cn } from "../../../utils/cn";
import Container from "../../../components/ui/Container";
import Link from "next/link";
import { useRouter } from "next/router";
import { catalogs } from "../../../utils/catalogs";
import { getProductsByCategory } from "../../../lib/products";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { ProductWithRating } from "@/types";

export interface CategoryProps {
  productsAndAverage: ProductWithRating[];
}

// rebuild the page at most once a minute so new ratings show up
export const REVALIDATE_SECONDS = 60;

export default function Category({ productsAndAverage }: CategoryProps) {
  const router = useRouter();
  const categoryId = router.query.categoryId;
  const subcategoryId =
    typeof router.query.subcategory === "string"
      ? router.query.subcategory
      : null;
  const currentCategory = catalogs.find(
    (category) => category.id === categoryId,
  );
  const count = productsAndAverage.length;

  return (
    <Container className="flex gap-8 py-6">
      <nav
        aria-label="Categories"
        className="sticky top-22 hidden w-56 shrink-0 self-start md:block"
      >
        <h2 className="mb-3 px-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Categories
        </h2>
        <ul className="space-y-0.5">
          {catalogs.map((category) => {
            const isActive = category.id === categoryId;
            return (
              <li key={category.id}>
                <Link
                  href={category.link}
                  aria-current={isActive && !subcategoryId ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm hover:bg-foreground/5",
                    isActive && "font-semibold text-primary",
                  )}
                >
                  {category.name}
                </Link>
                {isActive && (
                  <ul className="my-1 ml-3 space-y-0.5 border-l border-border pl-2">
                    {category.subcategory.map((subcategory) => (
                      <li key={subcategory}>
                        <Link
                          href={`${category.link}/${subcategory}`}
                          aria-current={
                            subcategory === subcategoryId ? "page" : undefined
                          }
                          className={cn(
                            "block rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                            subcategory === subcategoryId &&
                              "bg-primary/10 font-medium text-foreground",
                          )}
                        >
                          {subcategory}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        {subcategoryId && currentCategory && (
          <Link
            href={currentCategory.link}
            className="text-sm text-link hover:underline"
          >
            {currentCategory.name}
          </Link>
        )}
        <h1 className="text-2xl font-bold md:text-3xl">
          {subcategoryId ?? currentCategory?.name}
        </h1>
        {/* phones get the subcategories as a scrollable row of chips */}
        {currentCategory && (
          <nav
            aria-label="Subcategories"
            className="-mx-4 mt-4 overflow-x-auto px-4 md:hidden"
          >
            <ul className="flex gap-2">
              {[null, ...currentCategory.subcategory].map((subcategory) => {
                const isActive = subcategory === subcategoryId;
                return (
                  <li key={subcategory ?? "all"}>
                    <Link
                      href={
                        subcategory
                          ? `${currentCategory.link}/${subcategory}`
                          : currentCategory.link
                      }
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block rounded-full border px-4 py-1.5 text-sm whitespace-nowrap",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface hover:bg-muted",
                      )}
                    >
                      {subcategory ?? "All"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        {count > 0 ? (
          <ProductListing
            products={productsAndAverage}
            gridClassName="xl:grid-cols-4"
          />
        ) : (
          <EmptyState
            icon={BsBoxSeam}
            title="No products here yet"
            description="Try another category."
          />
        )}
      </div>
    </Container>
  );
}

export const getStaticProps: GetStaticProps<CategoryProps> = async ({
  params,
}) => {
  const res = await getProductsByCategory(String(params?.categoryId));
  const productsAndAverage = JSON.parse(JSON.stringify(res));

  return { props: { productsAndAverage }, revalidate: REVALIDATE_SECONDS };
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = catalogs.map((category) => {
    return {
      params: { categoryId: category.id },
    };
  });
  return { paths, fallback: false };
};
