import ImageSpotlight from "./ImageSpotlight"

export default function ImageSpotlightPage() {
  return (
    <main className="w-full p-6">
      <div className="flex justify-center">
        <ImageSpotlight
          src="/ui/imgstack/2.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={450}
          height={600}
        />
      </div>
    </main>
  )
}