/**
 * Pets Controller - HTTP Request Handler Layer
 * Handles request validation and response formatting
 */

import { Request, Response } from 'express';
import { PetsService } from './pets.service';
import { validateCreatePet, validateUpdatePet } from './pets.validation';
import { PetSpecies } from '@prisma/client';

export class PetsController {
  constructor(private petsService: PetsService) {}

  /**
   * GET /pets
   */
  async getPets(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const species = req.query.species as PetSpecies | undefined;

      const pets = await this.petsService.getPets(userId, species);

      res.json(pets);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /pets
   */
  async createPet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body;

      // Validate input
      const validation = validateCreatePet(data);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      // Convert birthDate string to Date if provided
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate);
      }

      const pet = await this.petsService.createPet(userId, data);

      res.status(201).json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /pets/:id
   */
  async getPetById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const pet = await this.petsService.getPetById(userId, id);

      if (!pet) {
        res.status(404).json({ error: 'Pet not found' });
        return;
      }

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /pets/:id
   */
  async updatePet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = req.body;

      // Validate input
      const validation = validateUpdatePet(data);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      // Convert birthDate string to Date if provided
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate);
      }

      const pet = await this.petsService.updatePet(userId, id, data);

      res.json(pet);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Pet not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /pets/:id
   */
  async deletePet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.petsService.deletePet(userId, id);

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Pet not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /pets/:id/recommendations
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const products = await this.petsService.getRecommendationsForPet(userId, id);

      res.json(products);
    } catch (error: any) {
      if (error.message === 'Pet not found') {
        res.status(404).json({ error: 'Pet not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
