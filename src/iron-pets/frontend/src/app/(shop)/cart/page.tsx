'use client';

import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cart.items.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-6 p-6 border-b last:border-b-0"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="flex-shrink-0"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium hover:text-primary transition mb-1"
                  >
                    {item.product.name}
                  </Link>

                  {item.variant && (
                    <p className="text-sm text-gray-600 mb-2">
                      {item.variant.name}
                    </p>
                  )}

                  <p className="font-bold text-lg">
                    ${item.product.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateItem.mutate({
                            itemId: item.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        className="px-3 py-2 hover:bg-gray-50 transition"
                        disabled={updateItem.isPending}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItem.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="px-3 py-2 hover:bg-gray-50 transition"
                        disabled={updateItem.isPending}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                      disabled={removeItem.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cart.shipping > 0 ? `$${cart.shipping.toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Promo code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Apply
              </button>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-3 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full py-3 text-center text-primary hover:text-primary-dark transition mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
