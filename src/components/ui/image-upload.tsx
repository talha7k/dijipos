'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ImageUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  path?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUploadStart,
  onUploadEnd,
  path = '',
  accept = 'image/*',
  maxSize = 2,
  className = '',
  disabled = false,
  placeholder = 'Upload image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputId = `image-upload-${Math.random().toString(36).substring(2, 11)}`;

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    onUploadStart?.();

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 11);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}_${randomId}.${extension}`;
      const fullPath = path ? `${path}/${filename}` : filename;

      // Upload to Firebase Storage
      const storageRef = ref(storage, fullPath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      onChange?.(downloadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        // Optional: Delete file from storage
        // const storageRef = ref(storage, value);
        // await deleteObject(storageRef);
      } catch (error) {
        console.warn('Could not delete image from storage:', error);
      }
    }
    onChange?.(null);
  };

  return (
    <div className={className}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled || uploading}
        className="hidden"
      />
      
      {value ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && document.getElementById(inputId)?.click()}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : placeholder}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploading ? 'Please wait' : `Max ${maxSize}MB`}
                </p>
              </div>
              {!uploading && !disabled && (
                <Button type="button" variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}