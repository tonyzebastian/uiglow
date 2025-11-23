"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function AppHeader({ title }) {
    return (
        <header className="w-full z-50">
            <div className="w-full px-6 py-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="https://www.tonyzeb.design/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                                Tony
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                                Playground
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {title && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                                        {title}
                                    </span>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}