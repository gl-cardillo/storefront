import Head from "next/head";
import { SITE_NAME, SITE_URL } from "../utils/constants";

const DEFAULT_DESCRIPTION =
  "Storefront is a demo online shop built with Next.js, React and MongoDB. Browse products, read reviews and fill a basket.";
const DEFAULT_IMAGE = "/og-image.jpg";

interface PageMetaProps {
  title?: string;
  description?: string;
  // a path on this site, made absolute for link previews
  image?: string;
  path?: string;
  type?: "website" | "product";
}

// keys let a page's tags replace the layout's defaults instead of duplicating them
export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path,
  type = "website",
}: PageMetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return (
    <Head>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:title" property="og:title" content={title ?? SITE_NAME} />
      <meta
        key="og:description"
        property="og:description"
        content={description}
      />
      <meta key="og:image" property="og:image" content={SITE_URL + image} />
      {path && (
        <meta key="og:url" property="og:url" content={SITE_URL + path} />
      )}
      <meta
        key="twitter:card"
        name="twitter:card"
        content="summary_large_image"
      />
    </Head>
  );
}
