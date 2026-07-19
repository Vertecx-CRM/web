"use client";
import React from "react";
import { useInView } from "react-intersection-observer";
import Layout from "../layout/Layout";
import SuppliersSlider from "../components/SuppliersSlider";
import HeaderSlider from "../components/HeaderSlider";
import Trajectory from "../components/Trajectory";
import OurServices from "../components/OurServices";
import GoogleAd from "../components/GoogleAd";

const Home = () => {
  const [refHeader, inViewHeader] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [refTrajectory, inViewTrajectory] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [refServices, inViewServices] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [refSuppliers, inViewSuppliers] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Layout>
      <div ref={refHeader}>
        <HeaderSlider inView={inViewHeader} />
      </div>
      <section className="px-6 sm:px-10 lg:px-20 py-14 bg-white">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-700">
              Vertecx Sistemas PC
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-black leading-tight">
              Vertecx, soporte tecnico empresarial y soluciones tecnologicas en
              Colombia.
            </h2>
          </div>
          <p className="text-gray-600 leading-7">
            En Vertecx ayudamos a empresas con mantenimiento preventivo,
            mantenimiento correctivo, redes, servidores, instalacion de equipos,
            venta de hardware y atencion tecnica especializada para mantener la
            continuidad operativa.
          </p>
        </div>
      </section>
      <div ref={refTrajectory} className="my-16">
        <Trajectory inView={inViewTrajectory} />
      </div>
      <div ref={refServices}>
        <OurServices inView={inViewServices} />
      </div>
      <GoogleAd className="my-8" />
      <div ref={refSuppliers}>
        <SuppliersSlider inView={inViewSuppliers} />
      </div>
    </Layout>
  );
};

export default Home;
