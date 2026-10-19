// Test-only values; never load a developer's .env or external providers.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://workshop:unused@127.0.0.1:1/unused';
process.env.USE_MOCK_SERVICES = 'true';
process.env.JWT_SECRET = 'workshop-test-only-secret-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'workshop-test-only-refresh-at-least-32-characters';
