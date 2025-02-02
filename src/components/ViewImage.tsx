import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Timer } from 'lucide-react';

export function ViewImage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: number | null = null;
    
    if (imageUrl && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      navigate('/');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [imageUrl, timeLeft, navigate]);

  useEffect(() => {
    const fetchImage = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const { data: images, error: fetchError } = await supabase
          .from('images')
          .select('url, is_viewed')
          .eq('view_token', token)
          .single();

        if (fetchError) throw fetchError;

        if (!images) {
          setError('Image not found or already viewed');
          return;
        }

        if (images.is_viewed) {
          setError('This image has already been viewed');
          return;
        }

        // Mark as viewed before showing the image
        const { error: updateError } = await supabase
          .from('images')
          .update({ is_viewed: true })
          .eq('view_token', token);

        if (updateError) throw updateError;

        setImageUrl(images.url);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Error loading image');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {timeLeft > 0 && imageUrl && (
          <div className="fixed top-4 right-4 bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-lg">{timeLeft}s</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload New Image
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : imageUrl ? (
            <div>
              <p className="text-center text-gray-600 mb-4">
                This image will only be viewable for 30 seconds - make sure to save it if needed!
              </p>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Shared image"
                  className="max-w-full w-full h-auto mx-auto"
                  onError={() => setError('Failed to load image')}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}