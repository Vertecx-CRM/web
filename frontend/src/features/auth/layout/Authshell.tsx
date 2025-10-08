"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "@/features/auth/login/auth.module.css";

const panelSpring = { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 };
const brandVariants = {
  initial: (side: "left" | "right") => ({ x: side === "left" ? -28 : 28, opacity: 0, scale: 0.985 }),
  animate: { x: 0, opacity: 1, scale: 1, transition: panelSpring },
  exit:   (side: "left" | "right") => ({ x: side === "left" ? 28 : -28, opacity: 0, scale: 0.985, transition: { duration: 0.25 } }),
};
const formVariants = {
  initial: (side: "left" | "right") => ({ x: side === "left" ? -32 : 32, opacity: 0, scale: 0.98 }),
  animate: { x: 0, opacity: 1, scale: 1, transition: { ...panelSpring, when: "beforeChildren", staggerChildren: 0.04 } },
  exit:   (side: "left" | "right") => ({ x: side === "left" ? 32 : -32, opacity: 0, scale: 0.985, transition: { duration: 0.22 } }),
};
const formChild = {
  initial: { y: 8, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.7 } },
};

export default function AuthShell({
  children,
  brand = { title: "SistemasPc", subtitle: "20 años conectando tu mundo", color: "#CC0000" },
  formSide = "right",
}: {
  children: React.ReactNode;
  brand?: { title: string; subtitle?: string; color?: string };
  formSide?: "left" | "right";
}) {
  const leftIsForm = formSide === "left";

  const BrandPanel = ({ side }: { side: "left" | "right" }) => (
    <motion.div
      custom={side}
      variants={brandVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={[
        "relative hidden lg:block",
        side === "left"
          ? "lg:rounded-l-2xl lg:rounded-r-none lg:-mr-px"
          : "lg:rounded-r-2xl lg:rounded-l-none lg:-ml-px",
        styles.brandPanel,
      ].join(" ")}
    >
      <div className={styles.brandBg} />
      <div className={styles.brandSheen} />
      <div className={styles.brandVignette} />
      <div className={styles.brandInnerShadow} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-10 text-center text-white">
        <motion.h2 className="mb-2 text-3xl font-black tracking-tight drop-shadow-sm" variants={formChild}>{brand.title}</motion.h2>
        {brand.subtitle && <motion.p className="max-w-xs text-sm text-white/90" variants={formChild}>{brand.subtitle}</motion.p>}
        <motion.div className="pointer-events-none absolute bottom-6 left-6 right-6" variants={formChild}>
          <div className={`mx-auto w-full max-w-[280px] rounded-lg bg-black/35 px-3 py-2 text-left text-[11px] leading-tight text-white/90 ${styles.brandChip}`}>
            <div className="font-semibold">Bienvenido</div>
            <div className="text-white/80">Autenticación simple, segura y moderna.</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const FormPanel = ({ side }: { side: "left" | "right" }) => (
    <motion.div
      custom={side}
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={[
        styles.panelSpot,
        "relative p-8",
        styles.cardStrong,
        side === "left"
          ? "lg:rounded-l-2xl lg:rounded-r-none lg:-mr-px"
          : "lg:rounded-r-2xl lg:rounded-l-none lg:-ml-px",
      ].join(" ")}
      style={{ willChange: "transform" }}
    >
      <motion.div variants={formChild}>{children}</motion.div>
    </motion.div>
  );

  return (
    <div className={styles.root} style={{ ["--brand" as any]: brand.color } as React.CSSProperties}>
      <div className={styles.content + " relative z-10 flex min-h-[100dvh] flex-col"}>
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg ring-0 lg:grid-cols-2">
            <AnimatePresence mode="wait" initial={false}>
              {leftIsForm
                ? <FormPanel key="form-left" side="left" />
                : <BrandPanel key="brand-left" side="left" />}
              {leftIsForm
                ? <BrandPanel key="brand-right" side="right" />
                : <FormPanel key="form-right" side="right" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
