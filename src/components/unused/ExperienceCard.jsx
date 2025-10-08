"use client";
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function ExperienceCard({ 
  heading, 
  description, 
  image, 
  component: Component, 
  componentProps = {}, 
  href, 
  newTab,
  componentBackground = "bg-slate-100 dark:bg-slate-800/10" // default background
}) {
  return (
    <a 
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className="block group hover:scale-[1.01] transition-all duration-300"
    >
      <div className="rounded-lg overflow-hidden">
      <div className="aspect-video w-full overflow-hidden border border-slate-200 dark:border-slate-900 rounded-lg dark:hover:border-blue-900 hover:border-blue-300">
          {Component ? (
            <div className={`w-full h-full flex items-center justify-center ${componentBackground}`}>
              <Component size={150} {...componentProps} />
            </div>
          ) : (
            <img 
              src={image} 
              alt={heading} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="pt-4">
          <h3 className="flex flex-row gap-2 items-center font-medium text-sm text-slate-900 dark:text-slate-100 font-sans tracking-wide">
            {heading}
            {newTab ? (
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-600" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
            )}
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-sans tracking-widest">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}