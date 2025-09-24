import ImageReveal from "./ImgTile"

export default function ImgTile() {
  return (
    <main className="w-full p-6 flex">
      <div className="w-full flex-1">
        <div className="h-full flex items-center justify-center">
          <div className='-ml-12'>  {/* Removed -ml-12 */}
            <ImageReveal 
                leftImage="/ui/imgtiles/left.jpg"
                middleImage="/ui/imgtiles/middle.jpg"
                rightImage="/ui/imgtiles/right.jpg"
            />
          </div>
        </div>
      </div>
    </main>
  )
}