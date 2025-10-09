import { cn } from "../../lib/utils";

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl gap-3",
        // Mobile: 3 rows - full, two halves, full
        "grid-cols-2 auto-rows-[18rem]",
        // Desktop: 3 columns
        "md:grid-cols-3 md:auto-rows-[18rem]",
        className
      )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  mobileLayout // Add this prop to control mobile layout
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-gray-900 bg-blue-300/10 p-4 transition duration-200 hover:shadow-xl dark:shadow-none",
        // Mobile layout classes
        mobileLayout === "full" && "col-span-2",
        mobileLayout === "half" && "col-span-1",
        // Desktop: all items span 1 column
        "md:col-span-1",
        className
      )}>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mb-2 font-sans font-bold text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};