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
          <div className="flex items-start gap-4">
            {data.image && (
              <div className="flex-shrink-0">
                <img
                  src={data.image}
                  alt={data.heading}
                  className="h-8 w-8 rounded-sm object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {data.heading}
              </h3>
              {data.description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {data.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {data.icon && (
              <div className="mb-3">
                {data.icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
          "bg-white dark:bg-slate-800",
          "border border-slate-200 dark:border-slate-700",
          isHovered && "border-slate-400 dark:border-slate-500",
          variant === "horizontal" ? "p-4" : "p-6",
          "overflow-hidden",
          "cursor-pointer",
          "hover:scale-[1.02]", // Add a subtle scale effect on hover
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
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        isHovered && "border-slate-400 dark:border-slate-500",
        variant === "horizontal" ? "p-4" : "p-6",
        "overflow-hidden",
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