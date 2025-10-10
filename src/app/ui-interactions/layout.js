// No "use client" directive - this will be a server component
import React from "react"
import AppHeader from "@/components/core/AppHeader"

export default function UIExplorationsLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="UI Interactions" />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}