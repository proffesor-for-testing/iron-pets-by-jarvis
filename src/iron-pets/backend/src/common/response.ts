import { Response } from 'express';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

/**
 * Pagination Metadata Interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Response Helper Class
 * Provides standardized API response methods
 */
export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      response.meta = {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      };
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data: T): Response {
    return ResponseHelper.success(res, data, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: code || 'ERROR',
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return ResponseHelper.success(res, data, 200, meta);
  }
}

/**
 * Pagination Helper
 */
export class PaginationHelper {
  /**
   * Parse and validate pagination parameters
   */
  static parse(
    page?: string | number,
    limit?: string | number
  ): { page: number; limit: number; skip: number } {
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    return {
      page: parsedPage,
      limit: parsedLimit,
      skip,
    };
  }

  /**
   * Calculate pagination metadata
   */
  static metadata(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

/**
 * Express response helpers
 */
export const sendSuccess = ResponseHelper.success;
export const sendCreated = ResponseHelper.created;
export const sendNoContent = ResponseHelper.noContent;
export const sendError = ResponseHelper.error;
export const sendPaginated = ResponseHelper.paginated;
