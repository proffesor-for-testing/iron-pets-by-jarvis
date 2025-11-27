import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductImages } from '@/components/products/ProductImages';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductTabs } from '@/components/products/ProductTabs';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { mockProducts } from '@/lib/mock-data';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string) {
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (DEMO_MODE) {
    const product = mockProducts.find(p => p.slug === slug || p.id === slug);
    if (!product) {
      notFound();
    }
    return product;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Fallback to mock for demo
        const product = mockProducts.find(p => p.slug === slug || p.id === slug);
        if (product) return product;
        notFound();
      }
      throw new Error('Failed to fetch product');
    }

    return res.json();
  } catch {
    // Fallback to mock data
    const product = mockProducts.find(p => p.slug === slug || p.id === slug);
    if (product) return product;
    notFound();
  }
}

function getRelatedProducts(productId: string): Product[] {
  // Cast mock products to Product type (mock data has compatible structure for display)
  return mockProducts.filter(p => p.id !== productId).slice(0, 4) as unknown as Product[];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);
  const relatedProducts = getRelatedProducts(product.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li><a href="/" className="text-gray-600 hover:text-gray-900">Home</a></li>
          <li className="text-gray-400">/</li>
          <li><a href="/products" className="text-gray-600 hover:text-gray-900">Products</a></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div>
          <Suspense fallback={<ImagesSkeleton />}>
            <ProductImages images={product.images} name={product.name} />
          </Suspense>
        </div>

        {/* Product Info & Add to Cart */}
        <div>
          <ProductInfo product={product} />

          <div className="mt-8 space-y-4">
            <AddToCartButton product={product} />

            <button className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
              Add to Wishlist
            </button>
          </div>

          {/* Product Features */}
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      <div>
        <RelatedProducts products={relatedProducts} title="You May Also Like" />
      </div>
    </div>
  );
}

function ImagesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | Iron Pets`,
    description: product.description?.substring(0, 160) || 'Pet product from Iron Pets',
    openGraph: {
      images: [product.images?.[0]?.url || product.image],
    },
  };
}
