import ProductsLanding from "@/features/landing/products/products";
import { fetchPublicProductsForSeo } from "@/lib/public-catalog";
import { absoluteUrl, createPageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Productos tecnologicos, computadores, redes y camaras",
  description:
    "Catalogo Vertecx Sistemas PC de computadores, portatiles, camaras de seguridad, redes, impresoras, componentes, accesorios y hardware empresarial en Colombia.",
  path: "/landing/products",
  image: "/assets/imgs/products/bannerproducts.jpg",
});

function productsCollectionJsonLd(
  products: NonNullable<Awaited<ReturnType<typeof fetchPublicProductsForSeo>>>,
) {
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  );

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/landing/products")}#products`,
    name: "Catalogo de productos tecnologicos Vertecx Sistemas PC",
    description:
      "Productos tecnologicos para empresas y hogares: computadores, camaras de seguridad, redes, impresoras, componentes, accesorios y hardware con soporte tecnico.",
    url: absoluteUrl("/landing/products"),
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
    publisher: {
      "@id": `${absoluteUrl("/")}#business`,
    },
    about: categories.length
      ? categories.map((category) => ({
          "@type": "Thing",
          name: category,
        }))
      : [
          { "@type": "Thing", name: "computadores" },
          { "@type": "Thing", name: "camaras de seguridad" },
          { "@type": "Thing", name: "redes" },
          { "@type": "Thing", name: "impresoras" },
          { "@type": "Thing", name: "hardware empresarial" },
        ],
    mainEntity: {
      "@type": "ItemList",
      name: `${SITE_NAME} productos tecnologicos`,
      itemListElement: products.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/landing/products/${product.id}`),
        name: product.title,
      })),
    },
  };
}

export default async function ProductsPage() {
  const products = await fetchPublicProductsForSeo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productsCollectionJsonLd(products)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <ProductsLanding />
    </>
  );
}
