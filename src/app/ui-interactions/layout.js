'use client'

import React from "react"
import AppHeader from "@/components/core/AppHeader"
import { usePathname } from "next/navigation"
import { navItems } from "./navigation-config"

export default function UIExplorationsLayout({ children }) {
  const pathname = usePathname()
  const currentItem = navItems.find(item => item.href === pathname)
  const title = currentItem?.label || 'UI Explorations'

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title={title} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
