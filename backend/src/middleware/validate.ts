import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import mongoose from 'mongoose';

export const createPhotoSchema = z.object({
  caption: z.string().optional(),
  date: z.string().optional(),
  chapter: z.enum(['Sweet Moments', 'Everyday Us', 'Adventures', 'Milestones']).optional(),
  favorite: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true')
    .optional(),
});

export const updatePhotoSchema = z.object({
  caption: z.string().optional(),
  date: z.string().optional(),
  chapter: z.enum(['Sweet Moments', 'Everyday Us', 'Adventures', 'Milestones']).optional(),
  favorite: z.boolean().optional(),
  order: z.number().optional(),
});

export const reorderSchema = z.object({
  photos: z.array(
    z.object({
      _id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId in reorder array',
      }),
      order: z.number(),
    })
  ),
});

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.format() });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateObjectId(req: Request, res: Response, next: NextFunction): void {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid photo ID format' });
    return;
  }
  next();
}
