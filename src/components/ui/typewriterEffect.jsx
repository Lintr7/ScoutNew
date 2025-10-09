"use client";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView, animate]);

  const renderWords = () => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char, index) => (
            <motion.span
              initial={{ opacity: 0, display: "inline-block", width: 0 }}
              key={`char-${index}`}
              className={cn(
                "dark:text-white text-black",
                word.className
              )}
            >
              {char}
            </motion.span>
          ))}
          {idx < wordsArray.length - 1 && (
            <span>&nbsp;</span>
          )}
        </div>
      ))}
    </motion.div>
  );

  return (
    <div
      className={cn(
        "text-xl sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {renderWords()}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-5 sm:h-6 md:h-9 lg:h-14 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const renderWords = () => (
    <div>
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char, index) => (
            <span
              key={`char-${index}`}
              className={cn(word.className || "text-white")}
            >
              {char}
            </span>
          ))}
          {idx < wordsArray.length - 1 && <span>&nbsp;</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("flex items-stretch space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{ duration: 2, ease: "linear", delay: 1 }}
      >
        <div
          className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-5xl font-bold"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}{" "}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-9 sm:h-9 md:h-9 lg:h-11 xl:h-11 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};