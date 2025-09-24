import ImgStack from "./ImgStack"

export default function ImgStackPage() {
  const imageUrls = [
    '/ui/imgstack/1.jpg',
    '/ui/imgstack/2.jpg',
    '/ui/imgstack/3.jpg',
    '/ui/imgstack/4.jpg',
    '/ui/imgstack/5.jpg'
  ];

  return (
    <main className="w-full p-6 flex">
      <div className="w-full flex-1">
        <div className="h-full flex items-center justify-center">
          <ImgStack images={imageUrls} />
        </div>
      </div>
    </main>
  )
}