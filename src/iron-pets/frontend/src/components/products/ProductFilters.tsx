'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Brand {
  id: string;
  name: string;
  count: number;
}

export interface ProductFiltersProps {
  brands?: Brand[];
  categorySlug?: string;
  onFilterChange?: (filters: FilterState) => void;
  onClearFilters?: () => void;
}

export interface FilterState {
  priceRange: [number, number];
  selectedBrands: string[];
  minRating: number;
  inStockOnly: boolean;
}

const defaultBrands: Brand[] = [
  { id: 'purina', name: 'Purina', count: 124 },
  { id: 'royal-canin', name: 'Royal Canin', count: 98 },
  { id: 'hills', name: "Hill's", count: 87 },
  { id: 'blue-buffalo', name: 'Blue Buffalo', count: 76 },
  { id: 'wellness', name: 'Wellness', count: 65 },
];

export function ProductFilters({
  brands = defaultBrands,
  categorySlug: _categorySlug,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    selectedBrands: [],
    minRating: 0,
    inStockOnly: false,
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleBrandToggle = (brandId: string) => {
    const selectedBrands = filters.selectedBrands.includes(brandId)
      ? filters.selectedBrands.filter((id) => id !== brandId)
      : [...filters.selectedBrands, brandId];
    updateFilters({ selectedBrands });
  };

  const handleClearFilters = () => {
    const resetFilters: FilterState = {
      priceRange: [0, 200],
      selectedBrands: [],
      minRating: 0,
      inStockOnly: false,
    };
    setFilters(resetFilters);
    onClearFilters?.();
  };

  const hasActiveFilters =
    filters.selectedBrands.length > 0 ||
    filters.minRating > 0 ||
    filters.inStockOnly ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;

  return (
    <div className="space-y-6 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={filters.priceRange[1]}
            onChange={(e) =>
              updateFilters({
                priceRange: [filters.priceRange[0], parseInt(e.target.value)],
              })
            }
            className="w-full accent-primary"
            aria-label="Maximum price"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="font-medium">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={filters.selectedBrands.includes(brand.id)}
                onChange={() => handleBrandToggle(brand.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="flex-1 text-sm">{brand.name}</span>
              <span className="text-xs text-gray-500">({brand.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <h3 className="font-medium">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => updateFilters({ minRating: rating })}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex items-center gap-1">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
                <span className="text-sm text-gray-600">& up</span>
              </div>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === 0}
              onChange={() => updateFilters({ minRating: 0 })}
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">All ratings</span>
          </label>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => updateFilters({ inStockOnly: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
