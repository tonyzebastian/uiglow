"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  SidebarProvider,
  Sidebar,
  SidebarSeparator,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Memoize the menu item to prevent unnecessary re-renders
const MenuItem = React.memo(function MenuItem({ href, label, isActive, onClick }) {
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
        <Link href={href} onClick={onClick}>{label}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})
MenuItem.displayName = "MenuItem"

export default function ClientSidebarWrapper({ children, navItems, activeItem }) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1">
        <Sidebar collapsible="none" className="pl-4 pt-4 pr-4">
          <SidebarSeparator />
          <SidebarContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <MenuItem
                  key={item.key || item.href}
                  href={item.href}
                  label={item.label}
                  isActive={activeItem ? activeItem === item.href.replace('#', '/ui-interactions/') || activeItem === item.href.replace('#', '/svg-animations/') : pathname === item.href}
                  onClick={item.onClick}
                />
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        {children}
      </div>
    </SidebarProvider>
  )
}
