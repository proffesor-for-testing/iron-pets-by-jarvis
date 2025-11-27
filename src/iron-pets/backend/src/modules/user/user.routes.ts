/**
 * User Routes - REQ-USR-001 to REQ-USR-004
 * Route definitions for user profile and address management
 */

import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

export function createUserRouter(prisma: PrismaClient): Router {
  const router = Router();
  const userService = new UserService(prisma);
  const userController = new UserController(userService);

  // All routes require authentication
  router.use(authenticate);

  // Profile management
  router.get('/profile', (req, res) => userController.getProfile(req, res));
  router.put('/profile', (req, res) => userController.updateProfile(req, res));
  router.put('/password', (req, res) => userController.changePassword(req, res));
  router.delete('/account', (req, res) => userController.deleteAccount(req, res));

  // Address management
  router.get('/addresses', (req, res) => userController.getAddresses(req, res));
  router.post('/addresses', (req, res) => userController.addAddress(req, res));
  router.put('/addresses/:id', (req, res) => userController.updateAddress(req, res));
  router.delete('/addresses/:id', (req, res) => userController.deleteAddress(req, res));
  router.put('/addresses/:id/default', (req, res) => userController.setDefaultAddress(req, res));

  return router;
}
