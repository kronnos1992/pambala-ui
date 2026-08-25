'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ZoomIn } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const [zoomPosition, setZoomPosition] = React.useState({ x: 50, y: 50 })
  const imageRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px]">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              'shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 transition-all',
              selectedIndex === i
                ? 'border-emerald-500'
                : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
            )}
          >
            <Image src={img} alt={`${name} ${i + 1}`} fill unoptimized loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>
      <div
        ref={imageRef}
        className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={images[selectedIndex]}
          alt={name}
          fill
          unoptimized
          loading="lazy"
          className="object-cover transition-transform duration-200"
          style={
            isZoomed
              ? {
                  transform: 'scale(2)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />
        {!isZoomed && (
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-500">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  )
}
