import Toolbar from "./toolbar"

export default function ToolbarPage() {
  return (
    <main className="w-full p-48 flex">
      <div className="w-full h-full">
        <div className="h-full flex items-center justify-center">
          <Toolbar />
        </div>
      </div>
    </main>
  )
}