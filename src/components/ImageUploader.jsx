import React, { useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUploader({ maxImages = 5, onImagesChange, initialPreviews = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState(initialPreviews);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPG, PNG, and WEBP are allowed.`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File too large: ${file.name}. Max size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      validFiles.push(file);
      // Create a temporary object URL for live preview
      newPreviews.push(URL.createObjectURL(file));
    }

    const updatedFiles = [...selectedFiles, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];
    
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    // Pass the actual File objects up to the parent form state
    // TODO (Supabase Storage): Parent component will map these File objects and upload them to Supabase Storage bucket, then save the returned public URLs to the database.
    onImagesChange(updatedFiles);
    
    // Reset input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    const fileToRemove = selectedFiles[indexToRemove];
    
    // Only revoke object URLs (skip strings that came from initialPreviews/backend)
    const previewToRemove = previews[indexToRemove];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }

    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);

    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onImagesChange(updatedFiles);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase text-neutral-600 flex items-center justify-between">
        <span>Upload Images</span>
        <span className="text-[10px] text-neutral-400 normal-case font-normal">
          {previews.length} / {maxImages} uploaded
        </span>
      </label>

      {/* Upload Zone */}
      {previews.length < maxImages && (
        <div className="relative border-2 border-dashed border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-[#C26B4A] transition-colors group cursor-pointer flex flex-col items-center justify-center py-6 px-4 bg-white">
          <input
            type="file"
            multiple
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="size-8 text-neutral-400 group-hover:text-[#C26B4A] mb-2" />
          <p className="text-sm text-neutral-600 font-medium">
            Click or drag images here
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            JPG, PNG, WEBP up to {MAX_SIZE_MB}MB
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md border border-red-100">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
          {previews.map((previewUrl, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border border-neutral-200 overflow-hidden group bg-neutral-100">
              <img 
                src={previewUrl} 
                alt={`Preview ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
