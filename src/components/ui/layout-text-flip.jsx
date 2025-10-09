"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [duration, words.length]);

  const getCurrentWord = () => {
    const word = words[currentIndex];
    if (typeof word === 'string') {
      return { text: word, image: null };
    }
    return word;
  };

  const currentWord = getCurrentWord();

  return (
    <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
      <motion.span
        layoutId="subtext"
        className="text-neutral-300/60 text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl whitespace-nowrap">
        {text}
      </motion.span>
      <motion.span
        layout
        className="relative w-fit overflow-hidden rounded-md border border-transparent px-4 py-2 font-sans text-2xl font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-500/30 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10 flex items-center gap-3 whitespace-nowrap flex-shrink-0">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={cn("inline-block whitespace-nowrap")}>
            {currentWord.text}
          </motion.span>
        </AnimatePresence>
        {currentWord.image && (
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`img-${currentIndex}`}
              src={currentWord.image}
              alt={currentWord.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 md:w-10 md:h-10 object-contain flex-shrink-0"
            />
          </AnimatePresence>
        )}
      </motion.span>
    </div>
  );
};