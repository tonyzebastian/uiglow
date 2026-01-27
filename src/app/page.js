'use client';

import DraggableCanvas from '@/components/canvas/DraggableCanvas';
import { canvasItems } from '@/data/canvasData';
import { Github, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export default function HomePage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Top Right Buttons */}
      <TooltipProvider>
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://www.tonyzeb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-lg"
              >
                <img
                  src="/profile.jpg"
                  alt="Tony Sebastian"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Portfolio</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://github.com/tonyzebastian/uiglow"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-lg"
              >
                <Github size={18} className="text-orange-500 dark:text-slate-300" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Github Repo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shadow-lg"
              >
                {isDark
                  ? <Sun size={18} className="text-orange-500 dark:text-slate-300" />
                  : <Moon size={18} className="text-orange-500 dark:text-slate-300" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Switch Theme</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Draggable Canvas */}
      <DraggableCanvas items={canvasItems} />
    </main>
  );
}
