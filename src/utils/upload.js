// src/utils/upload.js

export async function uploadFileToGCS({ file, zone = '', notes = '', type = '', apiBaseUrl = '' }) {
  // 1. Request signed URL
  const res = await fetch(`${apiBaseUrl}/getSignedUploadUrl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimetype: file.type,
      zone: zone || 'venue',
      notes,
      type,
    }),
  });
  if (!res.ok) throw new Error('Failed to get signed upload URL');
  const { url, objectPath } = await res.json();
  // 2. Upload file to signed URL
  const uploadRes = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error('Failed to upload file');
  // 3. Return public URL
  const bucket = type === 'venue'
    ? 'project-drishti-central1-bucket-venues'
    : 'project-drishti-central1-bucket';
  return `https://storage.googleapis.com/${bucket}/${objectPath}`;
} 