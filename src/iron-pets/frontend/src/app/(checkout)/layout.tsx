import Link from 'next/link';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-xl font-bold">Iron Pets</span>
            </Link>

            {/* Secure Checkout Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <p>&copy; 2024 Iron Pets. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>SSL Secure</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-8 h-6" viewBox="0 0 48 32" fill="currentColor">
                  <rect width="48" height="32" rx="4" fill="#1A1F71" />
                </svg>
                <svg className="w-8 h-6" viewBox="0 0 48 32" fill="currentColor">
                  <rect width="48" height="32" rx="4" fill="#EB001B" />
                </svg>
                <svg className="w-8 h-6" viewBox="0 0 48 32" fill="currentColor">
                  <rect width="48" height="32" rx="4" fill="#00579F" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
