/**
 * Pets Routes - REQ-PET-001 to REQ-PET-004
 * Route definitions for pet profile management and recommendations
 */

import { Router } from 'express';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

export function createPetsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const petsService = new PetsService(prisma);
  const petsController = new PetsController(petsService);

  // All routes require authentication
  router.use(authenticate);

  // Pet management
  router.get('/', (req, res) => petsController.getPets(req, res));
  router.post('/', (req, res) => petsController.createPet(req, res));
  router.get('/:id', (req, res) => petsController.getPetById(req, res));
  router.put('/:id', (req, res) => petsController.updatePet(req, res));
  router.delete('/:id', (req, res) => petsController.deletePet(req, res));

  // Product recommendations
  router.get('/:id/recommendations', (req, res) => petsController.getRecommendations(req, res));

  return router;
}
