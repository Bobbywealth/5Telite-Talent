// server/objectStorage.ts
import { Storage } from '@google-cloud/storage';

const projectId = process.env.GCS_PROJECT_ID || '';
const clientEmail = process.env.GCS_CLIENT_EMAIL || '';
const privateKey = (process.env.GCS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const bucketName = process.env.GCS_BUCKET || '';

const gcsConfigured = !!(projectId && clientEmail && privateKey && bucketName);

if (!gcsConfigured) {
  console.warn('GCS env vars missing (GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY, GCS_BUCKET). File uploads will be unavailable.');
}

export const storage = gcsConfigured
  ? new Storage({
      projectId,
      credentials: { client_email: clientEmail, private_key: privateKey },
    })
  : (null as unknown as Storage);

export const bucket = gcsConfigured
  ? storage.bucket(bucketName)
  : (null as any);

export { gcsConfigured };

export async function getSignedUploadUrl(opts: {
  objectName: string;
  contentType: string;
  expiresInSeconds?: number;
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