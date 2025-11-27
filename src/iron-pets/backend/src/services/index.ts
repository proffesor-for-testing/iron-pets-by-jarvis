/**
 * Service Factory
 * Creates and wires up all application services with proper dependencies
 */

import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { appConfig } from '../config';

// Services
import { JwtService } from '../utils/jwt.service';
import { EmailService } from '../utils/email.service';
import { getMockStripeService } from './mock-stripe.service';
import { MockEmailService, getMockEmailService } from './mock-email.service';

// Module services
import { AuthService } from '../modules/auth/auth.service';
import { CatalogService } from '../modules/catalog/catalog.service';
import { CartService } from '../modules/cart/cart.service';

// Module controllers
import { CatalogController } from '../modules/catalog/catalog.controller';

// Route creators
import { createAuthRouter } from '../modules/auth/auth.routes';
import { createCatalogRoutes } from '../modules/catalog/catalog.routes';
import cartRoutes from '../modules/cart/cart.routes';

export interface AppServices {
  prisma: PrismaClient;
  jwtService: JwtService;
  emailService: EmailService | MockEmailService;
  stripeService: any; // Stripe or MockStripeService
  authService: AuthService;
  catalogService: CatalogService;
  cartService: CartService;
}

export interface AppRouters {
  authRoutes: Router;
  catalogRoutes: Router;
  cartRoutes: Router;
}

/**
 * Initialize all application services
 */
export function initializeServices(prisma: PrismaClient): AppServices {
  // JWT Service
  const jwtService = new JwtService({
    secret: appConfig.auth.jwt.secret,
    expiresIn: appConfig.auth.jwt.expiresIn,
    refreshSecret: appConfig.auth.jwt.refreshSecret,
    refreshExpiresIn: appConfig.auth.jwt.refreshExpiresIn,
  });

  // Email Service (mock or real)
  let emailService: EmailService | MockEmailService;
  if (appConfig.email.useMock) {
    emailService = getMockEmailService(appConfig.email.fromEmail);
  } else {
    emailService = new EmailService(appConfig.app.baseUrl);
  }

  // Stripe Service (mock or real)
  let stripeService: any;
  if (appConfig.stripe.useMock) {
    stripeService = getMockStripeService({ enabled: true });
  } else {
    // In production, use real Stripe SDK
    const Stripe = require('stripe');
    stripeService = new Stripe(appConfig.stripe.secretKey);
  }

  // Module Services
  const authService = new AuthService(prisma, jwtService, emailService as any);
  const catalogService = new CatalogService(prisma);
  const cartService = new CartService(prisma);

  return {
    prisma,
    jwtService,
    emailService,
    stripeService,
    authService,
    catalogService,
    cartService,
  };
}

/**
 * Initialize all application routers
 */
export function initializeRouters(services: AppServices): AppRouters {
  const { prisma, jwtService, emailService, catalogService, cartService } = services;

  // Auth Routes
  const authRoutes = createAuthRouter(prisma, jwtService, emailService as any);

  // Catalog Routes
  const catalogController = new CatalogController(catalogService);
  const catalogRoutes = createCatalogRoutes(catalogController);

  // Cart Routes - using pre-configured routes
  // CartController is used internally by cart.routes.ts
  void cartService; // Explicitly mark as used

  return {
    authRoutes,
    catalogRoutes,
    cartRoutes,
  };
}

/**
 * Create standalone router instances for simple initialization
 * Used when dependency injection is handled elsewhere
 */
export function createStandaloneRouters(prisma: PrismaClient): AppRouters {
  const services = initializeServices(prisma);
  return initializeRouters(services);
}
