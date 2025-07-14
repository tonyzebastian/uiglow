"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarSeparator,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Memoize the menu item to prevent unnecessary re-renders
const MenuItem = React.memo(function MenuItem({ href, label, isActive }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="
        
          hover:bg-slate-100 dark:hover:bg-slate-800
          data-[active=true]:bg-slate-200 dark:data-[active=true]:bg-slate-700
          rounded-md
        "
      >
        <Link href={href}>{label}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})
MenuItem.displayName = "MenuItem"

function SidebarNav({ navItems }) {
  const pathname = usePathname()
  
  return (
    <Sidebar collapsible="none" className="pl-4 pt-4 pr-4">
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu className="gap-2">
          {navItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

// Export memoized version of SidebarNav
export default React.memo(SidebarNav)