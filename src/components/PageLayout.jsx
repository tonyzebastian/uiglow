"use client"

import React from 'react';
import AppHeader from '@/components/AppHeader';

const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <AppHeader variant="secondary" maxWidth="700px" />

      {/* Main Content */}
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="min-h-screen flex">
          {/* Left Sidebar */}
          <div className="flex-1 relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none"></div>
            Left Sidebar
          </div>

          {/* Main Content - Center with max-width */}
          <div className="w-[700px] md:w-[700px] lg:w-[800px] xl:w-[900px] border-x border-slate-200 dark:border-slate-800 pt-16">
            {children}
          </div>

          {/* Right Sidebar */}
          <div className="flex-1 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-200 dark:from-slate-900 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full [background-image:linear-gradient(0deg,transparent_50%,var(--gradient-color)_50%),linear-gradient(90deg,transparent_50%,var(--gradient-color)_50%)] [background-size:4px_4px] pointer-events-none"></div>
            Right Sidebar
          </div>
          
        </div>
      </main>

    </div>
  );
};

export default PageLayout;