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
        <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${
            variant === 'primary'
                ? 'w-auto'
                : 'top-0 left-0 right-0 translate-x-0 h-16 border-b border-slate-200 dark:border-slate-900'
        }`}>
            <div
                className={`h-full px-4 flex items-center justify-between ${
                    variant === 'primary'
                        ? 'bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 py-2 px-8 gap-12 min-w-[600px]'
                        : 'bg-white dark:bg-slate-950 w-full'
                }`}
            >
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        className="flex items-center gap-2"
                    >
                        {variant === 'secondary' ? (
                            <>
                                {secondaryLogo}
                                {title && (
                                    <>
                                        <span className="text-slate-400 dark:text-slate-600 text-2xl font-light">/</span>
                                        <span className="text-slate-700 dark:text-slate-300 text-base font-normal font-sans tracking-wide hover:dark:text-blue-300 hover:text-blue-800">
                                            {title}
                                        </span>
                                    </>
                                )}
                            </>
                        ) : (
                            <UIGlowLogo />
                        )}
                    </a>
                </div>

                <TooltipProvider>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.tonyzeb.design/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <img
                                src="/profile.jpg"
                                alt="Tony Sebastian"
                                className="w-6 h-6 rounded-full object-cover"
                            />
                        </a>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="https://github.com/tonyzebastian/uiglow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <GitHub size={16} className="text-slate-700 dark:text-slate-300" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Github Repo</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    {isDark
                                        ? <Sun size={16} className="text-slate-700 dark:text-slate-300" />
                                        : <Moon size={16} className="text-slate-700 dark:text-slate-300" />
                                    }
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Switch Theme</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </header>
    );
}