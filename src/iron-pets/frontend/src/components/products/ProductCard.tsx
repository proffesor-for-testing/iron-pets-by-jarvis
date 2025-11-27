'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isOnSale?: boolean;
  onAddToCart?: (id: string) => void;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  inStock,
  isOnSale = false,
  onAddToCart,
}: ProductCardProps) {
  const productUrl = `/products/${slug || id}`;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="group relative rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
        {isOnSale && (
          <Badge variant="error" className="font-semibold">
            -{discount}%
          </Badge>
        )}
        {!inStock && (
          <Badge variant="default" className="bg-gray-500">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Product Image */}
      <Link href={productUrl} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <Link href={productUrl}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {inStock ? (
          <p className="text-xs text-green-600 font-medium">In Stock</p>
        ) : (
          <p className="text-xs text-red-600 font-medium">Out of Stock</p>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          size="sm"
          disabled={!inStock}
          onClick={() => onAddToCart?.(id)}
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
}
