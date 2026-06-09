"use client";
import React from "react";
import { useInView } from "react-intersection-observer";
import Layout from "../layout/Layout";
import SuppliersSlider from "../components/SuppliersSlider";
import HeaderSlider from "../components/HeaderSlider";
import Trajectory from "../components/Trajectory";
import OurServices from "../components/OurServices";

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
      <div ref={refTrajectory} className="my-16">
        <Trajectory inView={inViewTrajectory} />
      </div>
      <div ref={refServices}>
        <OurServices inView={inViewServices} />
      </div>
      <div ref={refSuppliers}>
        <SuppliersSlider inView={inViewSuppliers} />
      </div>
    </Layout>
  );
};

export default Home;