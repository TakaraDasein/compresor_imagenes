"use client"

import { useRef, useEffect, memo } from "react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"
import "swiper/css"
import { useMediaQuery } from "@/hooks/use-media-query"
import { FileDown, FileUp, X } from "lucide-react"
import type { ImageItem } from "@/lib/types"

interface VerticalCarouselProps {
  images: ImageItem[]
  selectedImage: ImageItem | null
  onSelectImage: (image: ImageItem) => void
  onRemoveImage?: (imageId: string) => void
  view: "list" | "grid"
}

const ImageThumbnail = memo(function ImageThumbnail({
  image,
  selected,
  onSelectImage,
  onRemoveImage,
  view,
}: {
  image: ImageItem
  selected: boolean
  onSelectImage: (image: ImageItem) => void
  onRemoveImage?: (imageId: string) => void
  view: "list" | "grid"
}) {
  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return ""
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selected ? "border-white/80 shadow-lg" : "border-transparent"} ${view === "list" ? "h-full" : "aspect-square"}`}
      onClick={() => onSelectImage(image)}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar: ${image.file.name}`}
      aria-selected={selected}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
      {onRemoveImage && (
        <button
          className="absolute top-1 right-1 z-30 bg-red-500/70 hover:bg-red-500 rounded-full p-0.5 text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveImage(image.id)
          }}
          aria-label={`Eliminar: ${image.file.name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <img src={image.preview || "/placeholder.svg"} alt={image.file.name} className="h-full w-full object-cover" />
      {image.optimized && (
        <div className="absolute top-2 right-2 z-20 bg-green-500 rounded-full w-3 h-3" title="Optimized" />
      )}
      {image.isOptimizing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
            aria-label="Optimizando"
          />
        </div>
      )}
      {image.error && <div className="absolute top-2 left-2 z-20 bg-red-500 rounded-full w-3 h-3" title="Error" />}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white truncate z-20">{image.file.name}</div>
      {view === "list" && image.originalSize && (
        <div className="absolute bottom-6 left-2 z-20 flex items-center text-xs text-white/80">
          <FileUp className="w-3 h-3 mr-1" />
          {formatSize(image.originalSize)}
        </div>
      )}
      {view === "list" && image.optimizedSize && (
        <div className="absolute bottom-6 right-2 z-20 flex items-center text-xs text-white/80">
          <FileDown className="w-3 h-3 mr-1" />
          {formatSize(image.optimizedSize)}
        </div>
      )}
    </motion.div>
  )
})

const VerticalCarousel = memo(function VerticalCarousel({
  images,
  selectedImage,
  onSelectImage,
  onRemoveImage,
  view,
}: VerticalCarouselProps) {
  const swiperRef = useRef<any>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.update()
    }
  }, [images, view])

  if (view === "grid") {
    return (
      <div className="h-full w-full overflow-y-auto p-4">
        <motion.div layout className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <ImageThumbnail
              key={image.id}
              image={image}
              selected={selectedImage?.id === image.id}
              onSelectImage={onSelectImage}
              onRemoveImage={onRemoveImage}
              view="grid"
            />
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Swiper
        ref={swiperRef}
        direction={isMobile ? "horizontal" : "vertical"}
        slidesPerView="auto"
        spaceBetween={8}
        mousewheel={true}
        freeMode={true}
        modules={[FreeMode, Mousewheel]}
        className="h-full w-full p-4"
      >
        {images.map((image) => (
          <SwiperSlide key={image.id} className={`${isMobile ? "w-32 h-auto" : "w-full h-[calc(50%-4px)]"}`}>
            <ImageThumbnail
              image={image}
              selected={selectedImage?.id === image.id}
              onSelectImage={onSelectImage}
              onRemoveImage={onRemoveImage}
              view="list"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
})

export default VerticalCarousel
