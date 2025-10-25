import React from "react";
import { cn } from "../../lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion, transform } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import { CardDemo } from "./llmCard";
import GlobeDemo from "./globeDemo";
import NewsCarousel from "../newsCarousel";


export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Analyze Key Financial Metrics",
      description:
        "Track and manage your project issues with ease using our intuitive interface.",
      skeleton: <SkeletonOne />,
      className:
        "show-text col-span-1 lg:col-span-4 border lg:border rounded-2xl border-[rgba(255,255,255,0.1)] shadow-[0_0_100px_rgba(15,120,150,0.3)]",
    },
    {
      title: "Swipe Through Popular Companies",
      description:
        "Capture stunning photos effortlessly using our advanced AI technology.",
      skeleton: <SkeletonTwo />,
      className: "show-text border col-span-1 lg:col-span-2 rounded-2xl border-[rgba(255,255,255,0.1)] shadow-[0_0_100px_rgba(15,120,150,0.3)]",
    },
    {
      title: "Get LLM Sentiment Analysis",
      description:
        "Whether its you or Tyler Durden, you can get to know about our product on YouTube",
      skeleton: <SkeletonThree />,
      className:
        "show-text -z-1 col-span-1 lg:col-span-3 lg:border rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_100px_rgba(15,120,150,0.3)]",
    },
    {
      title: "Stay Updated on the Latest News",
      description:
        "With our blazing fast, state of the art, cutting edge, we are so back cloud servies (read AWS) - you can deploy your model in seconds.",
      skeleton: <SkeletonFour />,
      className: "show-text -z-1 min-h-[500px] col-span-1 lg:col-span-3 border lg:border rounded-2xl border-[rgba(255,255,255,0.1)] shadow-[0_0_100px_rgba(15,120,150,0.3)]",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">

      </div>
      <div className="relative ">
        <div
          className="grid grid-cols-1 lg:grid-cols-6 mt-19 xl:border rounded-md border-transparent">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>

              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className
}) => {
  return (
    <div className={cn(`bg-[#020429] p-4 sm:p-8 relative overflow-hidden scale-95 transition-transform duration-300`, className)}>
      {children}
    </div>
  );
};

const OpenAILogo = ({
  className
}) => {
  return (
    <svg
      className={className}
      width="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M26.153 11.46a6.888 6.888 0 0 0-.608-5.73 7.117 7.117 0 0 0-3.29-2.93 7.238 7.238 0 0 0-4.41-.454 7.065 7.065 0 0 0-2.41-1.742A7.15 7.15 0 0 0 12.514 0a7.216 7.216 0 0 0-4.217 1.346 7.061 7.061 0 0 0-2.603 3.539 7.12 7.12 0 0 0-2.734 1.188A7.012 7.012 0 0 0 .966 8.268a6.979 6.979 0 0 0 .88 8.273 6.89 6.89 0 0 0 .607 5.729 7.117 7.117 0 0 0 3.29 2.93 7.238 7.238 0 0 0 4.41.454 7.061 7.061 0 0 0 2.409 1.742c.92.404 1.916.61 2.923.604a7.215 7.215 0 0 0 4.22-1.345 7.06 7.06 0 0 0 2.605-3.543 7.116 7.116 0 0 0 2.734-1.187 7.01 7.01 0 0 0 1.993-2.196 6.978 6.978 0 0 0-.884-8.27Zm-10.61 14.71c-1.412 0-2.505-.428-3.46-1.215.043-.023.119-.064.168-.094l5.65-3.22a.911.911 0 0 0 .464-.793v-7.86l2.389 1.36a.087.087 0 0 1 .046.065v6.508c0 2.952-2.491 5.248-5.257 5.248ZM4.062 21.354a5.17 5.17 0 0 1-.635-3.516c.042.025.115.07.168.1l5.65 3.22a.928.928 0 0 0 .928 0l6.898-3.93v2.72a.083.083 0 0 1-.034.072l-5.711 3.255a5.386 5.386 0 0 1-4.035.522 5.315 5.315 0 0 1-3.23-2.443ZM2.573 9.184a5.283 5.283 0 0 1 2.768-2.301V13.515a.895.895 0 0 0 .464.793l6.897 3.93-2.388 1.36a.087.087 0 0 1-.08.008L4.52 16.349a5.262 5.262 0 0 1-2.475-3.185 5.192 5.192 0 0 1 .527-3.98Zm19.623 4.506-6.898-3.93 2.388-1.36a.087.087 0 0 1 .08-.008l5.713 3.255a5.28 5.28 0 0 1 2.054 2.118 5.19 5.19 0 0 1-.488 5.608 5.314 5.314 0 0 1-2.39 1.742v-6.633a.896.896 0 0 0-.459-.792Zm2.377-3.533a7.973 7.973 0 0 0-.168-.099l-5.65-3.22a.93.93 0 0 0-.928 0l-6.898 3.93V8.046a.083.083 0 0 1 .034-.072l5.712-3.251a5.375 5.375 0 0 1 5.698.241 5.262 5.262 0 0 1 1.865 2.28c.39.92.506 1.93.335 2.913ZM9.631 15.009l-2.39-1.36a.083.083 0 0 1-.046-.065V7.075c.001-.997.29-1.973.832-2.814a5.297 5.297 0 0 1 2.231-1.935 5.382 5.382 0 0 1 5.659.72 4.89 4.89 0 0 0-.168.093l-5.65 3.22a.913.913 0 0 0-.465.793l-.003 7.857Zm1.297-2.76L14 10.5l3.072 1.75v3.5L14 17.499l-3.072-1.75v-3.5Z"
        fill="currentColor"></path>
    </svg>
  );
};


const FeatureTitle = ({
  children
}) => {
  return (
    <p
      style={{ fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace", fontWeight: 'bold', fontSize: '1.15rem'}}
      className="max-w-5xl mx-auto text-left tracking-tight text-blue-200/50 text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({
  children
}) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-300 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}>
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div
        className="w-full  p-5  mx-auto bg-[rgb(1,4,35)] shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
          {/* TODO */}
          <div className="flex items-start">
            <img
              src="/metaReel.png"
              alt="header"
              style={{ marginTop: "-1em" }}
              className="h-90 w-90 aspect-square object-cover object-left-top rounded-sm"
            />
            <img
              src="/metaReel2.png"
              alt="header"
              style={{ marginTop: "3em" , marginLeft: '-1em', minWidth: '0em'}}
              className="h-60 w-120 aspect-square object-cover object-left-top rounded-sm"
            />
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-[#020429] via-[#020429] dark:via-[#020429] to-transparent w-full pointer-events-none" />
      <div
        className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-[#020429] via-transparent to-transparent w-full pointer-events-none" />
      <div
        className="absolute right-0 z-[100] inset-y-0 w-40 bg-gradient-to-l from-[#020429] dark:from-[#020429] to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="w-full p-5 mx-auto bg-[rgb(1,4,35)] shadow-2xl group h-full">
      <div style={{ marginTop: '-6em'}} className="flex justify-center align-center">
        <CardDemo />
      </div>
      <div style={{ marginTop: '-5em'}} className="flex justify-center align-center">
        <img
          src="/sentiment.png"
          alt="bali images"
          width="500"
          height="500" />
      </div>
      <div
        className="absolute bottom-0 z-40 inset-x-0 h-40 bg-gradient-to-t from-[#020429] via-[#020429] dark:via-[#020429] to-transparent w-full pointer-events-none" />
      
    </div>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "/metaFeature.png",
    "/googleFeature.jpg",
    "/appleFeature.jpg",
    "/microsoftFeature.png",
    "/amazonFeature.png"
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };
  return (
    <div
      className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      {/* TODO */}
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-neutral-600 border-neutral-500 border shrink-0 overflow-hidden">
            <img
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0" />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {[...images].reverse().map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-neutral-600 dark:bg-neutral-600 dark:border-neutral-500 border border-neutral-500 shrink-0 overflow-hidden">
            <img
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0" />
          </motion.div>
        ))}
      </div>
      <div
        className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-[#020429] dark:from-[#020429] to-transparent  h-full pointer-events-none" />
      <div
        className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-[#020429] dark:from-[#020429] to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <>
      <div
        style={{transform: 'scale(0.87)',}}
        className="globe-scaler h-30 md:h-30 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
        <GlobeDemo/>
      </div>
      <div style={{marginTop: '3em', width: '100%'}}>
      <NewsCarousel/>
      </div>
    </>
  );
};

export const Globe = ({
  className
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className} />
  );
};
