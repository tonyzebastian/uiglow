"use client"

import { GitHub, Moon, Sun } from 'react-feather';
import { useEffect, useState } from 'react';
import UIGlowLogo from './Logo';

export default function AppHeader() {
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
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 py-3 px-4 max-w-[1600px]">
            <UIGlowLogo />
            <div className="flex items-center gap-4">
                <div className="flex items-center px-2 gap-1">
                    <h1 className='font-sans text-sm text-slate-700 dark:text-slate-400'>made by</h1>
                    <a
                    href="https://www.tonyzeb.design/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                        <h2 className='font-heading text-sm text-blue-900 dark:text-blue-500 hover:underline'>tony sebastian</h2>
                    </a>
                </div>
                <a
                    href="https://github.com/tonyzebastian/uiglow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <GitHub size={16} className="text-slate-600 dark:text-slate-300" />
                </a>
                <button 
                    onClick={toggleTheme}
                    className="hover:cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {isDark ? 
                        <Sun size={16} className="text-slate-600 dark:text-slate-300 " /> : 
                        <Moon size={16} className="text-slate-600 dark:text-slate-300" />
                    }
                </button>
            </div>
        </div>
    );
}