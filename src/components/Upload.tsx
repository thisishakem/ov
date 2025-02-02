import React, { useState, useRef } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const copyTimeoutRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setErrorMessage(null);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyButtonText('Copied!');
      
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      
      // Set new timeout
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopyButtonText('Copy');
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setErrorMessage('Failed to copy to clipboard');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      const viewToken = nanoid();
      const filename = `${viewToken}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filename);

      // Save to database
      const { error: dbError } = await supabase
        .from('images')
        .insert([
          {
            url: publicUrl,
            view_token: viewToken,
          }
        ]);

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(dbError.message);
      }

      // Generate share link
      const shareUrl = `${window.location.origin}/view/${viewToken}`;
      setShareLink(shareUrl);
      setFile(null);
      if (document.getElementById('file-upload') instanceof HTMLInputElement) {
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">One-Time Image Share</h1>
          
          <div className="mb-6">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
              {errorMessage}
            </div>
          )}

          {file && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Selected file: {file.name}</p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          )}

          {shareLink && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Share this link (one-time use only):</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 p-2 text-sm border rounded-md"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  {copyButtonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}