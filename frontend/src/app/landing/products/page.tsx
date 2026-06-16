import ProductsLanding from "@/features/landing/products/products";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Productos tecnologicos y hardware empresarial",
  description:
    "Catalogo Vertecx de hardware, equipos, componentes y productos tecnologicos con stock actualizado para empresas y soporte especializado.",
  path: "/landing/products",
  image: "/assets/imgs/products/bannerproducts.jpg",
});

export default function ProductsPage() {
  return <ProductsLanding />;
}
