"use client"

import { GitHub, Moon, Sun, User, ArrowLeft } from 'react-feather';
import { useEffect, useState } from 'react';
import UIGlowLogo from './Logo';

export default function AppHeader({ variant = 'primary' }) {
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
                className="mx-auto h-full px-4 flex items-center justify-between border-x border-slate-200 dark:border-slate-900  md:w-[700px] lg:w-[800px] xl:w-[900px]"
            >
                {variant === 'secondary' ? (
                    <button 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                ) : (
                    <UIGlowLogo />
                )}

                <div className="flex items-center gap-4">
                    <a
                        href="https://www.tonyzeb.design/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <User size={16} className="text-slate-700 dark:text-slate-300" />
                    </a>
                    <a
                        href="https://github.com/tonyzebastian/uiglow"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <GitHub size={16} className="text-slate-700 dark:text-slate-300" />
                    </a>
                    <button 
                        onClick={toggleTheme}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        {isDark ? 
                            <Sun size={16} className="text-slate-700 dark:text-slate-300" /> : 
                            <Moon size={16} className="text-slate-700 dark:text-slate-300" />
                        }
                    </button>
                </div>
            </div>
        </header>
    );
}