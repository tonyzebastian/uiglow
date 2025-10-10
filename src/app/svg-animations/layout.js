// No "use client" directive - this will be a server component
import React from "react"
import AppHeader from "@/components/core/AppHeader"

export default function SvgAnimationLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="SVG Animations" />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}