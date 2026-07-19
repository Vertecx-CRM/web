import ProductDetailPage from "@/features/landing/products/components/ProductDetailPage";
import { fetchPublicProductForSeo } from "@/lib/public-catalog";
import {
  absoluteUrl,
  createPageMetadata,
  truncateDescription,
} from "@/lib/seo";

type ProductDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailRouteProps) {
  const { id } = await params;
  const product = await fetchPublicProductForSeo(id);

  if (!product) {
    return createPageMetadata({
      title: "Producto no disponible",
      description:
        "Este producto no esta disponible actualmente en el catalogo publico de Vertecx.",
      path: `/landing/products/${id}`,
    });
  }

  return createPageMetadata({
    title: `${product.title} | ${product.category}`,
    description: truncateDescription(
      `${product.title}. ${product.description}. Compra ${product.category} en Vertecx Sistemas PC Colombia con soporte tecnico y disponibilidad actualizada.`,
      170,
    ),
    path: `/landing/products/${product.id}`,
    image: product.image || "/assets/imgs/preview.png",
  });
}

function productJsonLd(product: NonNullable<Awaited<ReturnType<typeof fetchPublicProductForSeo>>>) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(`/landing/products/${product.id}`)}#product`,
    name: product.title,
    description: product.description,
    category: product.category,
    url: absoluteUrl(`/landing/products/${product.id}`),
  };

  const images = [product.image, ...(product.images ?? [])]
    .filter((image): image is string => Boolean(image))
    .map((image) => absoluteUrl(image));

  if (images.length) schema.image = images;

  if (typeof product.price === "number" && product.price > 0) {
    schema.offers = {
      "@type": "Offer",
      url: absoluteUrl(`/landing/products/${product.id}`),
      priceCurrency: "COP",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    };
  }

  return schema;
}

export default async function ProductDetailRoute({
  params,
}: ProductDetailRouteProps) {
  const { id } = await params;
  const product = await fetchPublicProductForSeo(id);

  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd(product)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      ) : null}
      <ProductDetailPage />
    </>
  );
}
