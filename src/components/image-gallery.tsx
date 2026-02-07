"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ImageGalleryProps {
  images?: Array<string | null | undefined>;
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const galleryImages = useMemo(() => {
    if (images && images.length > 0) {
      return images.filter(Boolean) as string[];
    }
    return [];
  }, [images]);

  useEffect(() => {
    setActiveImage(0);
  }, [galleryImages.length]);

  useEffect(() => {
    if (galleryImages.length < 2) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const displayImages = galleryImages.length > 0 ? galleryImages : Array.from({ length: 4 }, () => "");
  const activeUrl = displayImages[activeImage];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group shadow-sm">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt="Product image"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 60vw, 90vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-600 backdrop-blur-sm">
            {activeUrl ? 'View in full' : 'Placeholder preview'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 ${
              activeImage === idx ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:opacity-75'
            }`}
          >
            {img ? (
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
