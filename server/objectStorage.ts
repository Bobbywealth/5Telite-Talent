// server/objectStorage.ts
import { Storage } from '@google-cloud/storage';

const projectId = process.env.GCS_PROJECT_ID!;
const clientEmail = process.env.GCS_CLIENT_EMAIL!;
const privateKey = (process.env.GCS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const bucketName = process.env.GCS_BUCKET!;

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  throw new Error('Missing required GCS env vars (GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY, GCS_BUCKET)');
}

export const storage = new Storage({
  projectId,
  credentials: { client_email: clientEmail, private_key: privateKey },
});

export const bucket = storage.bucket(bucketName);

// Helpers
export async function getSignedUploadUrl(opts: {
  objectName: string;         // e.g. "headshots/12345.jpg"
  contentType: string;        // must match the browser PUT
  expiresInSeconds?: number;  // default 10 min
}) {
  const { objectName, contentType, expiresInSeconds = 600 } = opts;
  const file = bucket.file(objectName);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + expiresInSeconds * 1000,
    contentType,
  });

  return url;
}

export async function getSignedReadUrl(objectName: string, expiresInSeconds = 600) {
  const file = bucket.file(objectName);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}

export async function deleteObject(objectName: string) {
  await bucket.file(objectName).delete({ ignoreNotFound: true });
}