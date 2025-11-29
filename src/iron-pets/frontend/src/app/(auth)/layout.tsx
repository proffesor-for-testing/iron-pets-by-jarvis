import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IP</span>
            </div>
            <span className="text-xl font-bold">Iron Pets</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Simple Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Iron Pets. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/info/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/info/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/info/faq" className="hover:text-gray-900">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
