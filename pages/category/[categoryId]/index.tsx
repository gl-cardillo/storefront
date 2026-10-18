import ProductCard from "../../../components/ProductCard";
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
  const subcategoryId = router.query.subcategory || null;
  const currentCategory = catalogs.find(
    (category) => category.id === categoryId,
  );

  return (
    <Container className="flex gap-6 py-4">
      <div className="sticky top-20 hidden w-52 shrink-0 self-start rounded-lg border border-border bg-surface p-3 md:block">
        <h2 className="mb-3 text-2xl font-bold">Categories</h2>
        {catalogs.map((category, index) => {
          return (
            <div key={index}>
              <Link href={category.link}>
                <h3
                  className={`${
                    category.id === categoryId && "text-lg font-bold"
                  } mt-1 transition-transform duration-200 ease-in-out hover:scale-[1.02]`}
                >
                  {category.name}
                </h3>
              </Link>
              {category.id === categoryId &&
                category.subcategory.map((subcategory, index) => {
                  return (
                    <Link key={index} href={`${category.link}/${subcategory}`}>
                      <p
                        className={`${
                          subcategory === subcategoryId && "text-lg font-bold"
                        } pl-5 transition-transform duration-200 ease-in-out hover:scale-[1.02]`}
                      >
                        {subcategory}
                      </p>
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-2 border-b border-border pl-1 text-2xl font-bold md:hidden">
          {currentCategory?.name}
        </h3>
        <div className="flex items-center md:hidden">
          {currentCategory?.subcategory.map((subcategory, index) => {
            return (
              <Link key={index} href={`/category/${categoryId}/${subcategory}`}>
                <p
                  className={`${
                    subcategory === subcategoryId && "text-lg font-bold"
                  } pl-2`}
                >
                  {subcategory}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="my-2 justify-center md:flex md:flex-wrap">
          {productsAndAverage.length === 0 && (
            <p className="pt-5 text-center">No products found</p>
          )}
          {productsAndAverage.map((products) => {
            return (
              <ProductCard
                key={products.product._id}
                product={products.product}
                reviewAverage={products.reviewAverage}
              />
            );
          })}
        </div>
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
