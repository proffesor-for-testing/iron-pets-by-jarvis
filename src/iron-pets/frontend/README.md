# Iron Pets Frontend

Premium pet store e-commerce frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library + Playwright

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── api.ts            # Axios instance and API client
│   └── utils.ts          # Helper functions
├── store/                 # Zustand state stores
│   ├── auth.ts           # Authentication state
│   └── cart.ts           # Shopping cart state
└── types/                 # TypeScript type definitions
```

## Key Features

### Authentication State (Zustand)
- User session management
- Token refresh mechanism
- Persistent authentication

### Shopping Cart (Zustand)
- Add/remove items
- Quantity updates
- Tax calculation
- Persistent cart across sessions

### API Client (Axios)
- Automatic token injection
- Token refresh on 401
- Error handling
- Request/response interceptors

### Styling (Tailwind CSS)
- Custom brand colors
- Responsive design utilities
- Component variants
- Animation utilities
- Accessibility helpers

## Environment Variables

See `.env.example` for all available configuration options.

Required:
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## Architecture

### State Management
- **Global State**: Zustand for auth, cart, and shared state
- **Server State**: TanStack Query for API data
- **Form State**: React Hook Form for forms

### Data Flow
```
User Action → Component → Hook/Store → API Client → Backend
                ↓
            UI Update ← TanStack Query Cache ← API Response
```

### Authentication Flow
```
1. User logs in → API returns token + refreshToken
2. Token stored in Zustand (persisted to localStorage)
3. Axios interceptor adds token to all requests
4. On 401 → Refresh token → Retry request
5. On refresh fail → Logout user
```

## Contributing

1. Follow TypeScript strict mode
2. Use Tailwind CSS utilities (avoid custom CSS)
3. Write tests for new features
4. Follow existing code patterns
5. Keep components small and focused

## License

Proprietary - Iron Pets Team
