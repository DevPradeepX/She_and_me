const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface PhotoData {
  _id: string;
  caption: string;
  date: string;
  chapter: string;
  favorite: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export function getSecret(): string {
  if (typeof window === 'undefined') return '';
  return (
    sessionStorage.getItem('purnima-secret') ||
    localStorage.getItem('purnima-secret') ||
    ''
  );
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const secret = getSecret();
  return {
    'x-album-secret': secret,
    ...extraHeaders,
  };
}

export async function fetchPhotos(): Promise<PhotoData[]> {
  const res = await fetch(`${API_BASE}/api/photos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json();
}

export async function uploadPhoto(
  file: Blob,
  metadata: { caption?: string; date?: string; chapter?: string; favorite?: boolean }
): Promise<PhotoData> {
  const form = new FormData();
  form.append('photo', file, 'photo.jpg');
  if (metadata.caption !== undefined) form.append('caption', metadata.caption);
  if (metadata.date !== undefined) form.append('date', metadata.date);
  if (metadata.chapter !== undefined) form.append('chapter', metadata.chapter);
  if (metadata.favorite !== undefined) form.append('favorite', String(metadata.favorite));

  const res = await fetch(`${API_BASE}/api/photos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}

export async function deletePhotoApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete photo');
}

export async function updatePhotoApi(
  id: string,
  data: Partial<Pick<PhotoData, 'caption' | 'date' | 'chapter' | 'favorite' | 'order'>>
): Promise<PhotoData> {
  const res = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update photo');
  return res.json();
}

export async function reorderPhotosApi(
  photos: { _id: string; order: number }[]
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/photos/reorder`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ photos }),
  });
  if (!res.ok) throw new Error('Failed to reorder photos');
}

export function imageUrl(id: string): string {
  const secret = getSecret();
  return `${API_BASE}/api/photos/${id}/image?secret=${encodeURIComponent(secret)}`;
}
