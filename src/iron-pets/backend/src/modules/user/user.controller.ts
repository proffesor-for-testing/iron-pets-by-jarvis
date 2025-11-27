/**
 * User Controller - HTTP Request Handler Layer
 * Handles request validation and response formatting
 */

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { validateProfileUpdate, validatePasswordChange, validateAddress } from './user.validation';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /user/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await this.userService.getProfile(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /user/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body;

      // Validate input
      const validation = validateProfileUpdate(data);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const profile = await this.userService.updateProfile(userId, data);

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /user/password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body;

      // Validate input
      const validation = validatePasswordChange(data);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      await this.userService.changePassword(userId, data);

      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /user/account
   */
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      await this.userService.deleteAccount(userId, password);

      res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Password is incorrect') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /user/addresses
   */
  async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const addresses = await this.userService.getAddresses(userId);

      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /user/addresses
   */
  async addAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body;

      // Validate input
      const validation = validateAddress(data);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const address = await this.userService.addAddress(userId, data);

      res.status(201).json(address);
    } catch (error: any) {
      if (error.message === 'Maximum of 3 addresses allowed') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * PUT /user/addresses/:id
   */
  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = req.body;

      const address = await this.userService.updateAddress(userId, id, data);

      res.json(address);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Address not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /user/addresses/:id
   */
  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.userService.deleteAddress(userId, id);

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Address not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * PUT /user/addresses/:id/default
   */
  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const address = await this.userService.setDefaultAddress(userId, id);

      res.json(address);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Address not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
