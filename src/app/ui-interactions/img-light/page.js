import ImageSpotlight from "./ImageSpotlight"

export default function ImageSpotlightPage() {
  return (
    <main className="w-full p-6">
      <div className="flex justify-center gap-2">
        <ImageSpotlight
          src="/ui/imgstack/1.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="/ui/imgstack/2.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
        <ImageSpotlight
          src="/ui/imgstack/3.jpg"
          alt="Portrait image with spotlight effect"
          orientation="portrait"
          width={300}
          height={400}
        />
      </div>
    </main>
  )
}