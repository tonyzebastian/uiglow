"use client"

import { GitHub, Moon, Sun, User } from 'react-feather';
import { useEffect, useState } from 'react';
import UIGlowLogo from '../Logo';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

export default function AppHeader({ variant = 'primary', title, secondaryLogo }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme preference
        if (localStorage.theme === 'dark' || 
            (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 z-50">
            <div 
                className={`mx-auto h-full px-4 flex items-center justify-between ${
                    variant === 'primary' 
                        ? 'border-x border-slate-200 dark:border-slate-900 md:w-[700px] lg:w-[800px] xl:w-[900px]'
                        : 'w-full'
                }`}
            >
                <div className="flex items-center gap-4">
                    <a 
                        href="/"
                        className="flex items-center gap-2"
                    >
                        {variant === 'secondary' && secondaryLogo ? (
                            secondaryLogo
                        ) : (
                            <UIGlowLogo />
                        )}
                        {variant === 'secondary' && title && (
                            <span className="text-slate-700 dark:text-slate-300 text-lg font-medium font-sans tracking-wide hover:dark:text-blue-300 hover:text-blue-800">
                                {title}
                            </span>
                        )}
                    </a>
                </div>

                {/* ... rest of the code remains the same ... */}
                <TooltipProvider>
                    <div className="flex items-center gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="https://www.tonyzeb.design/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                >
                                    <User size={16} className="text-slate-700 dark:text-slate-300" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="top">Tony Sebastian</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="https://github.com/tonyzebastian/uiglow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                >
                                    <GitHub size={16} className="text-slate-700 dark:text-slate-300" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="top">Github Repo</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button 
                                    onClick={toggleTheme}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                >
                                    {isDark 
                                        ? <Sun size={16} className="text-slate-700 dark:text-slate-300" /> 
                                        : <Moon size={16} className="text-slate-700 dark:text-slate-300" />
                                    }
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Switch Theme</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </header>
    );
}