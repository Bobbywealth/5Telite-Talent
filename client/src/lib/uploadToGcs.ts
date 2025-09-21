// client/src/lib/uploadToGcs.ts
export async function uploadToGcs(file: File, prefix = 'uploads') {
  // 1) Ask backend for a signed upload URL
  const sig = await fetch('/api/files/signed-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type, prefix }),
    credentials: 'include', // if you use cookies/sessions
  }).then(r => {
    if (!r.ok) throw new Error('Failed to get signed upload URL');
    return r.json();
  });

  // 2) PUT the file to GCS with the exact Content-Type
  const putResp = await fetch(sig.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putResp.ok) throw new Error('Upload to GCS failed');

  // 3) Persist objectName in Postgres as needed (profile.photoKey, etc.)
  return sig.objectName; // e.g. "uploads/169..._myphoto.jpg"
}

// To render later (temporary read URL)
export async function getTempReadUrl(objectName: string) {
  const q = encodeURIComponent(objectName);
  const { url } = await fetch(`/api/files/signed-read/${q}`, {
    credentials: 'include',
  }).then(r => r.json());
  return url;
}
