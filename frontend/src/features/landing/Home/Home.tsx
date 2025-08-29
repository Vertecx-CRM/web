"use client";
import React from "react";
import Layout from "../layout/Layout";
import SuppliersSlider from "../components/SuppliersSlider";
import HeaderSlider from "../components/HeaderSlider";

const Home = () => {
  return (
    <Layout>
      <HeaderSlider />
      <SuppliersSlider />
    </Layout>
  );
};

export default Home;
