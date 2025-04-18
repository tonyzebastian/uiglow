'use client';

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import GradientBlob from "./backgrounds/GradientBlob";
import Link from "next/link";

const CustomCard = ({ 
  variant = "horizontal",
  data,  // This will contain all the content including href
  className,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <>
      {/* Card Content */}
      <div className="relative z-10">
        {variant === "horizontal" ? (
          <div className="flex flex-row items-center gap-4">
            {data.image && (
              <div className="flex-shrink-0">
                <img
                  src={data.image}
                  alt={data.heading}
                  className="h-8 w-18 rounded-sm object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold font-sans tracking-wide text-slate-800 dark:text-slate-200">
                {data.heading}
              </h3>
              {data.description && (
                <p className="mt-1 text-sm font-sans tracking-wider text-slate-800 dark:text-slate-200">
                  {data.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-4">
            {data.icon && (
              <div className="mb-3 text-slate-800 dark:text-slate-400">
                {data.icon}
              </div>
            )}
            <h3 className="text-base font-sans tracking-wider text-slate-800 dark:text-slate-200">
              {data.heading}
            </h3>
          </div>
        )}
      </div>

      {/* Gradient Container - Centered */}
      <div 
        className={cn(
          "absolute inset-0",
          "transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="w-[200px] h-[200px]">
          <GradientBlob width="100%" height="100%" />
        </div>
      </div>
    </>
  );

  return data.href ? (
    <Link href={data.href} className="block">
      <Card
        className={cn(
          "relative transition-all duration-300",
          "dark:bg-slate-950 bg-slate-50",
          "border dark:border-slate-900 border-slate-200",
          isHovered && "dark:border-slate-600 border-slate-400",
          variant === "horizontal" ? "p-4" : "p-6",
          "overflow-hidden",
          "cursor-pointer",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {cardContent}
      </Card>
    </Link>
  ) : (
    <Card
      className={cn(
        "relative transition-all duration-300",
        "dark:bg-slate-950 bg-slate-50",
        "border dark:border-slate-900 border-slate-200",
        isHovered && "dark:border-slate-600",
        variant === "horizontal" ? "p-4" : "p-6",
        "overflow-hidden",
        "cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {cardContent}
    </Card>
  );
};

export default CustomCard;