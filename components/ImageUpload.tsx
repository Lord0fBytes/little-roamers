'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImageUrl?: string | null;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  currentImageUrl,
  disabled = false,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreviewUrl(null);
      onImageSelect(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image must be less than 10MB');
      return;
    }

    // Check if HEIC/HEIF (browsers can't preview these natively)
    const isHeic = file.type === 'image/heic' ||
                   file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      // Show placeholder for HEIC files (will be converted server-side)
      setPreviewUrl('heic-placeholder');
      onImageSelect(file);
    } else {
      // Create preview for browser-supported formats
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-warm-700 mb-1.5">
        Photo
      </label>

      {/* Preview or Upload Area */}
      {previewUrl ? (
        <div className="relative w-full aspect-video bg-warm-100 rounded-card overflow-hidden group">
          {previewUrl === 'heic-placeholder' ? (
            // HEIC placeholder (browser can't preview HEIC natively)
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sage/20 to-sky/20">
              <svg
                className="w-16 h-16 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sage-dark font-semibold">HEIC Image Selected</p>
                <p className="text-sm text-warm-600">Preview will be available after upload</p>
              </div>
            </div>
          ) : (
            // Normal image preview
            <Image
              src={previewUrl}
              alt="Activity preview"
              fill
              className="object-cover"
            />
          )}
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 bg-clay text-white rounded-xl font-semibold shadow-card opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-clay-dark transform hover:scale-105"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-card opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700 transform hover:scale-105"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-full aspect-video border-2 border-dashed rounded-card
            flex flex-col items-center justify-center gap-3
            transition-all duration-300 cursor-pointer
            ${
              isDragging
                ? 'border-sage bg-sage/10 scale-[0.98]'
                : 'border-warm-300 bg-warm-50 hover:border-sage hover:bg-sage/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <svg
            className="w-12 h-12 text-warm-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm text-warm-700 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-warm-500 mt-1">
              JPEG, PNG, WebP, HEIC (max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Helper Text */}
      <p className="text-xs text-warm-500">
        📸 Tap to use camera or select from gallery
      </p>
    </div>
  );
}
