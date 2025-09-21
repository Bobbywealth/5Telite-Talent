import { useState, useEffect } from 'react';
import { getTempReadUrl } from '@/lib/uploadToGcs';

interface GcsImageProps {
  objectName: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to display images from Google Cloud Storage using signed URLs
 */
export function GcsImage({ objectName, alt, className, fallback }: GcsImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!objectName) {
      setLoading(false);
      setError(true);
      return;
    }

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const url = await getTempReadUrl(objectName);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load GCS image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [objectName]);

  if (loading) {
    return (
      <div className={`bg-slate-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-slate-400">
          <i className="fas fa-image text-2xl"></i>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={`bg-slate-200 flex items-center justify-center ${className}`}>
        <div className="text-slate-400">
          <i className="fas fa-image text-2xl"></i>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
