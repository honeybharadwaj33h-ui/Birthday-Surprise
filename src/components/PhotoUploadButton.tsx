import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { fileToDataUrl, saveMediaItem } from '../utils/mediaStorage.js';

interface PhotoUploadButtonProps {
  storageKey: string;
  onPhotoUploaded: (dataUrl: string) => void;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  storageKey,
  onPhotoUploaded,
  label = 'Add Photo',
  className = '',
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        await saveMediaItem(storageKey, dataUrl);
        onPhotoUploaded(dataUrl);
      } catch (err) {
        console.error('Failed to process image upload', err);
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        title="Upload photo from device (JPG, PNG, WEBP)"
        aria-label="Upload photo from device gallery"
        className={`flex items-center gap-1.5 rounded-full font-medium transition cursor-pointer backdrop-blur-md shadow-md hover:scale-105 active:scale-95 ${
          compact
            ? 'p-2 bg-white/90 hover:bg-white text-rose-700 hover:text-rose-900 border border-rose-200'
            : 'px-3 py-1.5 bg-white/95 hover:bg-white text-rose-800 border border-rose-200/90 text-xs'
        } ${className}`}
      >
        <Camera className="w-3.5 h-3.5 text-rose-600" />
        {!compact && <span>{label}</span>}
      </button>
    </>
  );
};
