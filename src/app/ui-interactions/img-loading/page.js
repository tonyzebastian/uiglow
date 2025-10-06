import ImageLoader from './ImageLoader'

export default function ImageLoadingPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-lg p-2 border border-slate-200 dark:border-slate-900">
          <ImageLoader
            src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/5_ionpyy.jpg"
            alt="Mountain landscape"
            width="800px"
            height="600px"
            gridSize={15}
            cellGap={15}
            cellShape="square"
            cellColor="#cbd5e1"
            blinkSpeed={2000}
            transitionDuration={300}
            fadeOutDuration={400}
            loadingDelay={1500}
            className="rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </div>
  )
}