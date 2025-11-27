import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductPagination } from '@/components/products/ProductPagination';
import { mockProducts } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    petType?: string;
    sort?: string;
  };
}

async function getProducts(filters: Record<string, string | number | undefined>, page: number) {
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (DEMO_MODE) {
    // Filter mock products
    let products = [...mockProducts];

    if (filters.category) {
      products = products.filter(p => p.category?.slug === filters.category);
    }
    if (filters.minPrice) {
      products = products.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    return { products, total: products.length, totalPages: 1 };
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (filters.category) params.set('category', String(filters.category));
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.petType) params.set('petType', String(filters.petType));
  if (filters.sort) params.set('sort', String(filters.sort));

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { products: mockProducts, total: mockProducts.length, totalPages: 1 };
    }

    return res.json();
  } catch {
    // Fallback to mock data on error
    return { products: mockProducts, total: mockProducts.length, totalPages: 1 };
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Number(searchParams.page) || 1;

  const productsData = await getProducts({
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    petType: searchParams.petType,
    sort: searchParams.sort || 'featured',
  }, page);
  const products = productsData.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">All Products</h1>
            <p className="text-gray-600">
              Discover the best products for your beloved pets
            </p>
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
      {[1, 2, 3, 4].map((i) => (
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

export const metadata = {
  title: 'All Products | Iron Pets',
  description: 'Browse our complete selection of pet products',
};
