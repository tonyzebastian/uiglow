// src/components/InteractiveTitle.jsx
"use client";

import { useState, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function InteractiveTitle({ heading, href, image, newTab = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <a
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          className="inline-block cursor-pointer transition-all duration-300"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <h3 className="text-base font-sans font-medium tracking-wider text-slate-800 dark:text-slate-200 hover:underline underline-offset-2 hover:dark:text-blue-300 hover:text-blue-800">
            {heading}
            {newTab
              ? <ExternalLink className="inline-block ml-1 w-4 h-4 dark:text-slate-400 text-slate-700" />
              : <ArrowRight   className="inline-block ml-1 w-4 h-4 dark:text-slate-400 text-slate-700" />
            }
          </h3>
        </a>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="!w-auto max-w-[20rem] max-h-[80vh] dark:bg-slate-900 bg-slate-50 shadow-xl p-2"
      >
        <img src={image} alt={heading} className="block rounded-lg overflow-hidden max-w-full max-h-full object-contain"/>
      </PopoverContent>
    </Popover>
  );
}