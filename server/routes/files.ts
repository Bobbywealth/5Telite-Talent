// server/routes/files.ts
import { Router } from 'express';
import { z } from 'zod';
import { getSignedUploadUrl, getSignedReadUrl, deleteObject } from '../objectStorage';

const router = Router();

// POST /api/files/signed-upload
// body: { filename: string, contentType: string, prefix?: string }
router.post('/signed-upload', async (req, res, next) => {
  try {
    const body = z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1),
      prefix: z.string().optional(), // e.g. "headshots", "reels"
    }).parse(req.body);

    const safeName = body.filename.replace(/\s+/g, '_');
    const objectName = `${body.prefix ? body.prefix + '/' : ''}${Date.now()}_${safeName}`;

    const url = await getSignedUploadUrl({
      objectName,
      contentType: body.contentType,
    });

    res.json({ url, objectName });
  } catch (err) {
    next(err);
  }
});

// GET /api/files/signed-read/:objectName (URL-encoded)
// returns { url }
router.get('/signed-read/:objectName', async (req, res, next) => {
  try {
    const objectName = decodeURIComponent(req.params.objectName);
    const url = await getSignedReadUrl(objectName);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/files/:objectName (optional admin-only)
router.delete('/:objectName', async (req, res, next) => {
  try {
    const objectName = decodeURIComponent(req.params.objectName);
    await deleteObject(objectName);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
