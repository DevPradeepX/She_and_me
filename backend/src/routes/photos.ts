import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Photo } from '../models/Photo.js';
import {
  createPhotoSchema,
  updatePhotoSchema,
  reorderSchema,
  validateBody,
  validateObjectId,
} from '../middleware/validate.js';
import { readLimiter, uploadLimiter, deleteLimiter } from '../middleware/rateLimiter.js';
import { requireSecret } from '../middleware/auth.js';

const router = Router();

// Require secret word for all photo endpoints
router.use(requireSecret);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// GET /api/photos - return list of photos (excluding image binary)
router.get('/', readLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    const photos = await Photo.find().select('-image').sort({ order: 1, createdAt: 1 });
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/photos/:id/image - serve raw image binary
router.get('/:id/image', readLimiter, validateObjectId, async (req: Request, res: Response): Promise<void> => {
  try {
    const photo = await Photo.findById(req.params.id).select('image contentType');
    if (!photo || !photo.image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.set({
      'Content-Type': photo.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(photo.image);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// POST /api/photos - upload image + metadata
router.post(
  '/',
  uploadLimiter,
  upload.single('photo'),
  validateBody(createPhotoSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file uploaded' });
        return;
      }

      const lastPhoto = await Photo.findOne().sort({ order: -1 }).select('order');
      const order = lastPhoto ? lastPhoto.order + 1 : 0;

      const newPhoto = new Photo({
        image: req.file.buffer,
        contentType: req.file.mimetype,
        caption: req.body.caption || '',
        date: req.body.date || '',
        chapter: req.body.chapter || 'Sweet Moments',
        favorite: req.body.favorite || false,
        order,
      });

      await newPhoto.save();

      const responseDoc = newPhoto.toObject();
      delete (responseDoc as { image?: unknown }).image;

      res.status(201).json(responseDoc);
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  }
);

// PATCH /api/photos/reorder - reorder multiple photos
router.patch(
  '/reorder',
  validateBody(reorderSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { photos } = req.body;
      const bulkOps = photos.map((p: { _id: string; order: number }) => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { order: p.order } },
        },
      }));

      await Photo.bulkWrite(bulkOps);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering photos:', error);
      res.status(500).json({ error: 'Failed to reorder photos' });
    }
  }
);

// PATCH /api/photos/:id - update photo metadata
router.patch(
  '/:id',
  validateObjectId,
  validateBody(updatePhotoSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedPhoto = await Photo.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).select('-image');

      if (!updatedPhoto) {
        res.status(404).json({ error: 'Photo not found' });
        return;
      }

      res.json(updatedPhoto);
    } catch (error) {
      console.error('Error updating photo:', error);
      res.status(500).json({ error: 'Failed to update photo' });
    }
  }
);

// DELETE /api/photos/:id - delete photo
router.delete(
  '/:id',
  deleteLimiter,
  validateObjectId,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedPhoto = await Photo.findByIdAndDelete(req.params.id);
      if (!deletedPhoto) {
        res.status(404).json({ error: 'Photo not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  }
);

export default router;
