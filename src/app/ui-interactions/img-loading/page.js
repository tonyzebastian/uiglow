"use client"

import { useState } from 'react'
import ImageLoader from './ImageLoader'

export default function ImageLoadingPage() {
  const [gridSize, setGridSize] = useState(20)
  const [cellGap, setCellGap] = useState(4)
  const [cellShape, setCellShape] = useState('circle')
  const [blinkSpeed, setBlinkSpeed] = useState(1000)
  const [key, setKey] = useState(0)

  const reload = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cell Size: {gridSize}px
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cell Gap: {cellGap}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={cellGap}
                onChange={(e) => setCellGap(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Blink Speed: {blinkSpeed}ms
              </label>
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={blinkSpeed}
                onChange={(e) => setBlinkSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cell Shape
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCellShape('circle')}
                  className={`px-4 py-2 rounded ${
                    cellShape === 'circle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Circle
                </button>
                <button
                  onClick={() => setCellShape('square')}
                  className={`px-4 py-2 rounded ${
                    cellShape === 'square'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Square
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={reload}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Reload Animation
              </button>
            </div>
          </div>
        </div>

        {/* Image Loader Demo */}
        <div className="bg-slate-800/30 backdrop-blur rounded-lg p-6">
          <ImageLoader
            key={key}
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            alt="Mountain landscape"
            gridSize={gridSize}
            cellGap={cellGap}
            cellShape={cellShape}
            blinkSpeed={blinkSpeed}
            transitionDuration={800}
            fadeOutDuration={600}
            onLoad={() => console.log('Image loaded!')}
            className="rounded-lg overflow-hidden"
          />
        </div>

        {/* Additional Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/30 backdrop-blur rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Small Grid</h3>
            <ImageLoader
              key={`small-${key}`}
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop"
              alt="Ocean waves"
              gridSize={30}
              cellGap={5}
              cellShape="circle"
              blinkSpeed={800}
              className="rounded-lg overflow-hidden"
            />
          </div>

          <div className="bg-slate-800/30 backdrop-blur rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Dense Grid</h3>
            <ImageLoader
              key={`dense-${key}`}
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop"
              alt="Forest path"
              gridSize={15}
              cellGap={2}
              cellShape="square"
              blinkSpeed={1200}
              className="rounded-lg overflow-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  )
}