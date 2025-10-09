// No "use client" directive - this will be a server component
import React from "react"
import AppHeader from "@/components/core/AppHeader"
import UIGlowLogo from "@/components/Logo"

export default function SvgAnimationLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader variant="secondary" title="SVG Animations" secondaryLogo={<UIGlowLogo variant="mini" />}/>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}