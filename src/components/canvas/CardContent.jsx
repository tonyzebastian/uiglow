'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import CurvedArrow from './arrows/CurvedArrow';

// Component registry
const componentMap = {
  ClockPreview: dynamic(() => import('@/components/previews/ClockPreview')),
  JellyTagsSingle: dynamic(() => import('@/app/ui-interactions/jellytags/JellyTagsSingle')),
  CoinFlip: dynamic(() => import('@/app/svg-animations/coinflip/CoinFlip')),
  ToolsPreview: dynamic(() => import('@/components/previews/ToolsPreview')),
};

function CardContent({ contentType, content, component, componentProps, title }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Image content
  if (contentType === 'image') {
    return (
      <div className="relative w-full h-full">
        <Image
          src={content}
          alt={title}
          fill
          className="object-cover rounded-lg"
          sizes="280px"
        />
      </div>
    );
  }

  // Video content
  if (contentType === 'video') {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        {!isPlaying ? (
          <>
            <video
              src={content}
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
                className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <Play className="w-6 h-6 text-gray-900 ml-1" />
              </button>
            </div>
          </>
        ) : (
          <video
            src={content}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            controls
            playsInline
          />
        )}
      </div>
    );
  }

  // Text content
  if (contentType === 'text') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-lg text-slate-700 dark:text-slate-300 text-center whitespace-pre-line font-medium">
          {content}
        </p>
      </div>
    );
  }

  // Group title
  if (contentType === 'group-title') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 font-sans">
          {content}
        </h2>
      </div>
    );
  }

  // Arrow
  if (contentType === 'arrow') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CurvedArrow direction={content} width="100%" height="100%" />
      </div>
    );
  }

  // Component content
  if (contentType === 'component') {
    const Component = componentMap[component];

    if (!Component) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Component not found</p>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <Component {...(componentProps || {})} />
      </div>
    );
  }

  return null;
}

export default memo(CardContent);
