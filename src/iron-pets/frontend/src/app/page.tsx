import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Welcome to <span className="text-brand-600">Iron Pets</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Premium pet products for your beloved companions. Quality food, toys, and accessories.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Premium Quality</h3>
            <p className="text-neutral-600">
              Only the finest products for your pets, carefully selected and tested.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Fast Delivery</h3>
            <p className="text-neutral-600">
              Quick and reliable shipping to ensure your pets never run out.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Expert Support</h3>
            <p className="text-neutral-600">
              Our team of pet experts is here to help you make the best choices.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-brand-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to spoil your pets?</h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">
            Browse our curated collection of premium pet products.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-brand-600 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
          >
            Shop Now
          </Link>
        </section>
      </div>
    </main>
  );
}
