import { Request, Response, NextFunction } from 'express';

export function requireSecret(req: Request, res: Response, next: NextFunction): void {
  const expectedSecret = (process.env.ALBUM_SECRET || 'meripurnima').trim().toLowerCase();
  const headerSecret = (req.headers['x-album-secret'] as string || '').trim().toLowerCase();
  const querySecret = (req.query.secret as string || '').trim().toLowerCase();

  if (headerSecret === expectedSecret || querySecret === expectedSecret) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized: Secret word required' });
}
