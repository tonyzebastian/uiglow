"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
            heading: "Content",
            items: [
                { name: "Posts", href: "/posts" },
                { name: "Projects", href: "/projects" },
            ]
        },
    ];

    return (
        <aside className="pb-12 w-64">
            <div className="space-y-4 py-4">
                {navigation.map((section, index) => (
                    <div key={index} className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            {section.heading}
                        </h2>
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                                <Button
                                    key={itemIndex}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start",
                                        pathname === item.href && "bg-muted"
                                    )}
                                    asChild
                                >
                                    <Link href={item.href}>{item.name}</Link>
                                </Button>
                            ))}
                        </div>
                        {index < navigation.length - 1 && (
                            <Separator className="my-4" />
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}