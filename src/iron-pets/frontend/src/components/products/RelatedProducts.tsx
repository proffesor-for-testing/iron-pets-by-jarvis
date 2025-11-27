'use client';

import { Product } from '@/types';
import { ProductCard } from './ProductCard';

export interface RelatedProductsProps {
  products?: Product[];
  productId?: string;
  categoryId?: string;
  title?: string;
}

export function RelatedProducts({ products, productId: _productId, categoryId: _categoryId, title = 'Related Products' }: RelatedProductsProps) {
  // Note: In a real implementation, productId and categoryId would be used to fetch related products
  // For now, we just render the products array if provided
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            rating={product.rating}
            reviewCount={product.reviewCount}
            inStock={product.inStock}
            isOnSale={product.isOnSale}
          />
        ))}
      </div>
    </section>
  );
}
