import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchPhotos,
  uploadPhoto,
  deletePhotoApi,
  updatePhotoApi,
  reorderPhotosApi,
  imageUrl,
} from '@/lib/api';
import { fileToBlob, type PhotoRecord } from '@/lib/photos';
import { toast } from 'sonner';

export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPhotos();
      setPhotos(data as PhotoRecord[]);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const getImageUrl = useCallback((id: string) => imageUrl(id), []);
  const urlFor = getImageUrl;

  const toggleFavorite = useCallback(
    async (id: string) => {
      const target = photos.find((p) => p._id === id);
      if (!target) return;
      const updated = { ...target, favorite: !target.favorite };
      setPhotos((prev) => prev.map((p) => (p._id === id ? updated : p)));
      try {
        await updatePhotoApi(id, { favorite: updated.favorite });
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
        setPhotos((prev) => prev.map((p) => (p._id === id ? target : p)));
      }
    },
    [photos]
  );

  const updatePhoto = useCallback(
    async (photo: PhotoRecord) => {
      setPhotos((prev) => prev.map((p) => (p._id === photo._id ? photo : p)));
      try {
        await updatePhotoApi(photo._id, {
          caption: photo.caption,
          date: photo.date,
          chapter: photo.chapter,
          favorite: photo.favorite,
        });
      } catch (err) {
        console.error('Failed to update photo:', err);
        await refresh();
      }
    },
    [refresh]
  );

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      try {
        let count = 0;
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) continue;
          const blob = await fileToBlob(file);
          const caption = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
          await uploadPhoto(blob, { caption });
          count++;
        }
        if (count > 0) {
          toast.success(`Successfully uploaded ${count} photo${count > 1 ? 's' : ''}`);
        }
        await refresh();
      } catch (err: any) {
        console.error('Failed to upload photos:', err);
        toast.error(err.message || 'Failed to upload photo. Please check secret word and backend.');
      } finally {
        setUploading(false);
      }
    },
    [refresh]
  );

  const removePhoto = useCallback(
    async (id: string) => {
      try {
        await deletePhotoApi(id);
        await refresh();
      } catch (err) {
        console.error('Failed to delete photo:', err);
      }
    },
    [refresh]
  );

  const reorder = useCallback(
    async (ordered: PhotoRecord[]) => {
      const withOrder = ordered.map((p, i) => ({ ...p, order: i }));
      setPhotos(withOrder);
      try {
        await reorderPhotosApi(withOrder.map((p) => ({ _id: p._id, order: p.order })));
      } catch (err) {
        console.error('Failed to reorder:', err);
        await refresh();
      }
    },
    [refresh]
  );

  const favoriteCount = useMemo(
    () => photos.filter((p) => p.favorite).length,
    [photos]
  );

  return {
    photos,
    loading,
    uploading,
    getImageUrl,
    urlFor,
    favoriteCount,
    toggleFavorite,
    updatePhoto,
    addPhotos,
    removePhoto,
    reorder,
    refresh,
  };
}
