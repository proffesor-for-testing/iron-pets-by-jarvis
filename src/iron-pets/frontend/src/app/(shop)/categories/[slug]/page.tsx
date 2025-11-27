import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductPagination } from '@/components/products/ProductPagination';
import { mockCategories, mockProducts } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

async function getCategory(slug: string) {
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (DEMO_MODE) {
    const category = mockCategories.find(c => c.slug === slug);
    if (!category) notFound();
    return category;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const category = mockCategories.find(c => c.slug === slug);
      if (category) return category;
      notFound();
    }

    return res.json();
  } catch {
    const category = mockCategories.find(c => c.slug === slug);
    if (category) return category;
    notFound();
  }
}

async function getCategoryProducts(categorySlug: string, filters: Record<string, string | number | undefined>) {
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (DEMO_MODE) {
    let products = mockProducts.filter(p => p.category?.slug === categorySlug);

    if (filters.minPrice) {
      products = products.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    return { products, total: products.length, totalPages: 1 };
  }

  try {
    const params = new URLSearchParams();
    params.set('category', categorySlug);
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sort) params.set('sort', String(filters.sort));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const products = mockProducts.filter(p => p.category?.slug === categorySlug);
      return { products, total: products.length, totalPages: 1 };
    }

    return res.json();
  } catch {
    const products = mockProducts.filter(p => p.category?.slug === categorySlug);
    return { products, total: products.length, totalPages: 1 };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategory(params.slug);
  const page = Number(searchParams.page) || 1;

  const productsData = await getCategoryProducts(params.slug, {
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sort: searchParams.sort || 'featured',
  });
  const products = productsData.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        {category.image && (
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6">
                <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
              </div>
            </div>
          </div>
        )}

        {!category.image && (
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters categorySlug={params.slug} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>

            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestselling">Best Selling</option>
            </select>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>

          <Suspense fallback={<div className="h-16" />}>
            <ProductPagination
              currentPage={page}
              totalPages={productsData.totalPages || 1}
              totalItems={productsData.total || products.length}
              itemsPerPage={12}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug);

  return {
    title: `${category.name} | Iron Pets`,
    description: `Shop ${category.name} products at Iron Pets`,
  };
}
