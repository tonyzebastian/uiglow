// No "use client" directive - this will be a server component
import React from "react"
import AppHeader from "@/components/core/AppHeader"
import { SidebarInset } from "@/components/ui/sidebar"
import ClientSidebarWrapper from "@/components/core/ClientSidebarWrapper"
import UIGlowLogoMini from "@/components/LogoMini"
import { navItems } from "./navigation-config";




export default function SvgAnimationLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader variant="secondary" title="Svg Animations" secondaryLogo={<UIGlowLogoMini />}/>
      
      {/* Wrap only the interactive sidebar parts in a client component */}
      <ClientSidebarWrapper navItems={navItems}>
        <SidebarInset className="
          flex items-center justify-center
          border-l border-slate-200 dark:border-slate-900
          pl-6 pr-8 py-6
        ">
          {children}
        </SidebarInset>
      </ClientSidebarWrapper>
    </div>
  )
}