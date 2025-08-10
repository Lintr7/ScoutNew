"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Add offset to make scrolling begin earlier
    offset: ["start end", "end start"]
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [1.05, 0.9] : [1.05, 1];
  };

  // Adjust the scroll ranges to make element flat when centered
  const rotate = useTransform(scrollYProgress, [0.2, 0.45, 1], [20, 0, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0.2, 1], [0, -100]);

  return (
    <div
      className="h-[70rem] md:h-[80rem] flex items-center justify-center relative p-8 md:p-20"
      ref={containerRef}>
      <div
        className="py-20 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center">
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-3xl md:max-w-3xl -mt-12 mx-auto h-[40rem] md:h-[30rem] w-full border-4 border-[#6C6C6C] p-3 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl">
      <div
        className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 p-2 md:p-4 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </motion.div>
  );
};