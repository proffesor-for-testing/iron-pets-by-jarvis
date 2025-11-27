'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface SubCategory {
  name: string;
  href: string;
}

interface Category {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

const categories: Category[] = [
  {
    name: 'Dogs',
    href: '/dogs',
    subcategories: [
      { name: 'Food & Treats', href: '/dogs/food' },
      { name: 'Toys', href: '/dogs/toys' },
      { name: 'Beds & Furniture', href: '/dogs/beds' },
      { name: 'Collars & Leashes', href: '/dogs/collars' },
      { name: 'Grooming', href: '/dogs/grooming' },
      { name: 'Health & Wellness', href: '/dogs/health' },
    ],
  },
  {
    name: 'Cats',
    href: '/cats',
    subcategories: [
      { name: 'Food & Treats', href: '/cats/food' },
      { name: 'Toys', href: '/cats/toys' },
      { name: 'Litter & Accessories', href: '/cats/litter' },
      { name: 'Scratchers', href: '/cats/scratchers' },
      { name: 'Grooming', href: '/cats/grooming' },
      { name: 'Health & Wellness', href: '/cats/health' },
    ],
  },
  {
    name: 'Small Pets',
    href: '/small-pets',
    subcategories: [
      { name: 'Food & Treats', href: '/small-pets/food' },
      { name: 'Habitats', href: '/small-pets/habitats' },
      { name: 'Bedding', href: '/small-pets/bedding' },
      { name: 'Toys & Accessories', href: '/small-pets/toys' },
      { name: 'Health Care', href: '/small-pets/health' },
    ],
  },
];

export function Navigation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <nav className="hidden lg:block bg-gray-50 border-b">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-8">
          {categories.map((category) => (
            <li
              key={category.name}
              className="relative"
              onMouseEnter={() => setActiveCategory(category.name)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                href={category.href}
                className="flex items-center py-4 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {category.name}
                {category.subcategories && (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </Link>

              {/* Dropdown Menu */}
              {category.subcategories && activeCategory === category.name && (
                <div className="absolute left-0 top-full z-50 w-56 rounded-lg bg-white shadow-lg border">
                  <ul className="py-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Categories</h2>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <div>
                    <button
                      className="flex w-full items-center justify-between py-2 text-left font-medium"
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.name ? null : category.name
                        )
                      }
                    >
                      {category.name}
                      {category.subcategories && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedCategory === category.name ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {category.subcategories && expandedCategory === category.name && (
                      <ul className="ml-4 mt-2 space-y-2 border-l pl-4">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className="block py-1 text-sm text-gray-600 hover:text-primary"
                              onClick={onClose}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
