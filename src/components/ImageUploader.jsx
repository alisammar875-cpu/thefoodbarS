import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { IMGBB_API_KEY } from '../constants/config';
import { useToast } from '../contexts/ToastContext';

export default function ImageUploader({ onUploadSuccess, initialImage = null, folder = 'menu' }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }

    // Check file size (max 5MB for ImgBB free)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      const promise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
      });

      xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
      xhr.send(formData);

      const result = await promise;
      
      if (result.success) {
        const url = result.data.url;
        setPreview(url);
        onUploadSuccess(url);
        addToast("Image uploaded successfully!", "success");
      } else {
        throw new Error("ImgBB error");
      }
    } catch (err) {
      setError("Upload failed. Please check your API key or connection.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onUploadSuccess('');
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden ${
          dragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
        } ${preview ? 'border-none p-0' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && !uploading && inputRef.current.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />

        {preview ? (
          <div className="group relative w-full h-full min-h-[200px]">
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl max-h-[300px]" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => inputRef.current.click()}
                className="bg-white text-bg-dark px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors"
              >
                Change
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" 
                  strokeDasharray={176} strokeDashoffset={176 - (176 * progress) / 100}
                  className="text-primary transition-all duration-300" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{progress}%</span>
              </div>
            </div>
            <p className="text-sm font-bold text-white">Uploading...</p>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Upload className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Click or drag to upload</p>
            <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/50 p-2 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-[10px] text-red-200 font-bold leading-tight">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
