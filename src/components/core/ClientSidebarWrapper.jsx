"use client"

import React from "react"
import dynamic from "next/dynamic"
import { SidebarProvider, SidebarMenuSkeleton } from "@/components/ui/sidebar"

// Dynamic import of SidebarNav
const SidebarNav = dynamic(() => import("@/components/core/SidebarNav"), { 
  ssr: false,
  loading: () => (
    <div className="pl-4 py-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <SidebarMenuSkeleton key={i} showIcon={false} />
      ))}
    </div>
  )
})

export default function ClientSidebarWrapper({ children, navItems }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 pt-16">
        <SidebarNav navItems={navItems} />
        {children}
      </div>
    </SidebarProvider>
  )
}