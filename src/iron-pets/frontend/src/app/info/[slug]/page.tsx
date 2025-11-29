import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface InfoPageProps {
  params: { slug: string };
}

const infoPages: Record<string, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Last updated: January 2024
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account,
          make a purchase, or contact us for support. This information may include your name,
          email address, postal address, phone number, and payment information.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to process transactions, send you order confirmations,
          respond to your requests, and improve our services. We may also use your information
          to send you promotional communications about products and services that may interest you.
        </p>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share
          your information with service providers who assist us in operating our website and
          conducting our business.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:privacy@ironpets.com" className="text-primary hover:underline">
            privacy@ironpets.com
          </a>
        </p>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Last updated: January 2024
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Iron Pets, you accept and agree to be bound by these Terms
          of Service. If you do not agree to these terms, please do not use our services.
        </p>

        <h2>Use of Service</h2>
        <p>
          You agree to use our service only for lawful purposes and in accordance with these
          terms. You are responsible for maintaining the confidentiality of your account information.
        </p>

        <h2>Products and Pricing</h2>
        <p>
          All product descriptions and prices are subject to change without notice. We reserve
          the right to limit quantities and refuse any order at our discretion.
        </p>

        <h2>Shipping and Returns</h2>
        <p>
          Please refer to our Shipping and Returns policies for detailed information about
          delivery times and our return process.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Iron Pets shall not be liable for any indirect, incidental, special, or consequential
          damages resulting from the use of our services.
        </p>
      </div>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div className="space-y-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">How do I place an order?</h3>
          <p className="text-gray-600">
            Simply browse our products, add items to your cart, and proceed to checkout.
            You can create an account or checkout as a guest.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
          <p className="text-gray-600">
            We accept all major credit cards (Visa, MasterCard, American Express), PayPal,
            and Apple Pay.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">How long does shipping take?</h3>
          <p className="text-gray-600">
            Standard shipping takes 5-7 business days. Express shipping (2-3 business days)
            is available for an additional fee.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">What is your return policy?</h3>
          <p className="text-gray-600">
            We offer a 30-day return policy for most items. Products must be unused and in
            original packaging. See our Returns page for details.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">How can I track my order?</h3>
          <p className="text-gray-600">
            Once your order ships, you&apos;ll receive an email with tracking information.
            You can also track your order in your account under &quot;My Orders&quot;.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">Do you offer subscriptions?</h3>
          <p className="text-gray-600">
            Yes! Set up auto-delivery for your pet&apos;s favorite products and save up to 15%.
            Manage subscriptions anytime from your account.
          </p>
        </div>
      </div>
    ),
  },
  contact: {
    title: 'Contact Us',
    content: (
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have a question or need help? We&apos;re here to assist you. Reach out through any
            of the channels below.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <a href="mailto:support@ironpets.com" className="text-primary hover:underline">
                support@ironpets.com
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">1-800-IRON-PETS (1-800-476-6738)</p>
              <p className="text-sm text-gray-500">Mon-Fri: 9am-6pm EST</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-gray-600">
                Iron Pets HQ<br />
                123 Pet Lane<br />
                San Francisco, CA 94102
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-6">Send us a Message</h3>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    ),
  },
  shipping: {
    title: 'Shipping Information',
    content: (
      <div className="prose max-w-none">
        <h2>Shipping Options</h2>

        <div className="grid md:grid-cols-3 gap-6 not-prose mb-8">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Standard</h3>
            <p className="text-3xl font-bold text-primary mb-2">Free</p>
            <p className="text-gray-600">Orders over $49</p>
            <p className="text-sm text-gray-500 mt-2">5-7 business days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Express</h3>
            <p className="text-3xl font-bold text-primary mb-2">$9.99</p>
            <p className="text-gray-600">All orders</p>
            <p className="text-sm text-gray-500 mt-2">2-3 business days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Next Day</h3>
            <p className="text-3xl font-bold text-primary mb-2">$19.99</p>
            <p className="text-gray-600">Order by 2pm EST</p>
            <p className="text-sm text-gray-500 mt-2">Next business day</p>
          </div>
        </div>

        <h2>Shipping Restrictions</h2>
        <p>
          Currently, we ship to all 50 US states. Some oversized items may have shipping
          restrictions. International shipping coming soon!
        </p>

        <h2>Order Processing</h2>
        <p>
          Orders placed before 2pm EST on business days are typically processed the same day.
          You&apos;ll receive a confirmation email with tracking information once your order ships.
        </p>
      </div>
    ),
  },
  returns: {
    title: 'Returns & Exchanges',
    content: (
      <div className="prose max-w-none">
        <h2>Our Return Policy</h2>
        <p>
          We want you and your pets to be completely satisfied with your purchase. If you&apos;re
          not happy with an item, you can return it within 30 days of delivery.
        </p>

        <h2>Return Conditions</h2>
        <ul>
          <li>Items must be unused and in original packaging</li>
          <li>Food items must be unopened and sealed</li>
          <li>Include your order number with the return</li>
          <li>Use a trackable shipping method</li>
        </ul>

        <h2>How to Return</h2>
        <ol>
          <li>Log into your account and go to &quot;My Orders&quot;</li>
          <li>Select the order and items you want to return</li>
          <li>Print the prepaid return label</li>
          <li>Pack items securely and drop off at any carrier location</li>
        </ol>

        <h2>Refunds</h2>
        <p>
          Refunds are processed within 5-7 business days of receiving your return.
          The refund will be credited to your original payment method.
        </p>

        <h2>Exchanges</h2>
        <p>
          For exchanges, simply return the original item and place a new order for the
          desired item. This ensures the fastest processing time.
        </p>
      </div>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    content: (
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Last updated: January 2024
        </p>

        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit our website.
          They help us provide a better browsing experience and understand how you use our site.
        </p>

        <h2>Types of Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          Required for the website to function properly. These enable core features like
          shopping cart and account login.
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          Help us understand how visitors interact with our website by collecting and
          reporting information anonymously.
        </p>

        <h3>Marketing Cookies</h3>
        <p>
          Used to track visitors across websites to display relevant advertisements.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          You can control cookies through your browser settings. Note that disabling
          certain cookies may affect website functionality.
        </p>
      </div>
    ),
  },
  accessibility: {
    title: 'Accessibility Statement',
    content: (
      <div className="prose max-w-none">
        <h2>Our Commitment</h2>
        <p>
          Iron Pets is committed to ensuring digital accessibility for people with disabilities.
          We continually improve the user experience for everyone and apply relevant accessibility
          standards.
        </p>

        <h2>Accessibility Features</h2>
        <ul>
          <li>Keyboard navigation support</li>
          <li>Screen reader compatibility</li>
          <li>Sufficient color contrast ratios</li>
          <li>Resizable text without loss of functionality</li>
          <li>Alternative text for images</li>
          <li>Clear and consistent navigation</li>
        </ul>

        <h2>Standards</h2>
        <p>
          We aim to conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
        </p>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of our website. Please contact us at{' '}
          <a href="mailto:accessibility@ironpets.com" className="text-primary hover:underline">
            accessibility@ironpets.com
          </a>
        </p>
      </div>
    ),
  },
};

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const page = infoPages[params.slug];

  if (!page) {
    return {
      title: 'Page Not Found | Iron Pets',
    };
  }

  return {
    title: `${page.title} | Iron Pets`,
    description: `${page.title} for Iron Pets - Your trusted pet supplies store`,
  };
}

export default function InfoPage({ params }: InfoPageProps) {
  const page = infoPages[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{page.title}</li>
          </ol>
        </nav>

        {/* Page Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
          {page.content}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(infoPages).map((slug) => ({
    slug,
  }));
}
