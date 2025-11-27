'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductFilters } from '@/components/products/ProductFilters';
import { useSearchProducts } from '@/hooks/useProducts';

export const dynamic = 'force-dynamic';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'relevance';

  const { data, isLoading, error } = useSearchProducts({
    query,
    page,
    category: category || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  });

  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load search results</p>
      </div>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {data.total} {data.total === 1 ? 'result' : 'results'} for &quot;{query}&quot;
        </p>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg"
          defaultValue={sort}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set('sort', e.target.value);
            window.location.href = `/search?${params.toString()}`;
          }}
        >
          <option value="relevance">Most Relevant</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="bestselling">Best Selling</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.products.map((product: any) => (
          <div key={product.id} className="group">
            <a href={`/products/${product.slug}`}>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="font-medium mb-1 group-hover:text-primary transition">
                {product.name}
              </h3>
              <p className="text-gray-600">${product.price.toFixed(2)}</p>
            </a>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }).toString()}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </a>
            )}

            {[...Array(data.totalPages)].map((_, i) => (
              <a
                key={i}
                href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(i + 1) }).toString()}`}
                className={`px-4 py-2 border rounded-lg ${
                  i + 1 === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </a>
            ))}

            {page < data.totalPages && (
              <a
                href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }).toString()}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function SearchSkeleton() {
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

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="font-bold mb-4">Refine Results</h2>
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Search Results */}
        <main className="flex-1">
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults />
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
