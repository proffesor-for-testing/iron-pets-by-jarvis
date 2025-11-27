'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface ProductImagesProps {
  images: string[];
  productName?: string;
  name?: string;
}

export function ProductImages({ images, productName, name }: ProductImagesProps) {
  const displayName = productName || name || 'Product';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg'];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={displayImages[selectedIndex]}
          alt={`${displayName} - Image ${selectedIndex + 1}`}
          fill
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${displayName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {displayImages.length > 1 && (
        <p className="text-sm text-gray-500 text-center">
          {selectedIndex + 1} of {displayImages.length}
        </p>
      )}
    </div>
  );
}
