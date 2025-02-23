"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"  // Add this import

export default function AppSidebar() {
    const pathname = usePathname()
    
    const navigation = [
        {
            items: [
                { name: "Home", href: "/" },
            ]
        },
        {
            //heading: "React Components",
            items: [
                { name: "JellyTags", href: "/ui-explorations/jellytags" },
                { name: "Upvote", href: "/ui-explorations/upvote" },
                { name: "Music Player", href: "/ui-explorations/music-player" },
                { name: "Toolbar", href: "/ui-explorations/toolbar" },
                { name: "Clock", href: "/ui-explorations/clock" },
            ]
        },
    ];

    return (
        <aside className="h-[calc(100vh-5rem)] w-72 ">
            <div className="py-4">
                {navigation.map((section, index) => (
                    <div key={index} className="px-3 ">
                        <h2 className="mb-2 text-sm font-sans text-slate-400">
                            {section.heading}
                        </h2>
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                                <Button
                                    key={itemIndex}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start font-sans  tracking-wide text-sm text-slate-800 dark:text-slate-200",
                                        pathname === item.href && "bg-muted"
                                    )}
                                    asChild
                                >
                                    <Link href={item.href}>{item.name}</Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}