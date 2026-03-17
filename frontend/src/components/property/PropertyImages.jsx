import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Camera, ZoomIn } from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop';

const PropertyImages = ({ images = [], title = 'Property' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [{ url: PLACEHOLDER, publicId: 'placeholder' }];

  const handlePrev = () => setSelectedIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  const handleNext = () => setSelectedIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <div className="select-none">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 group">
        <img
          src={displayImages[selectedIndex]?.url || PLACEHOLDER}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="w-full h-80 md:h-[480px] object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />

        {/* Image count badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black bg-opacity-60 text-white text-xs px-2.5 py-1.5 rounded-full">
          <Camera className="w-3.5 h-3.5" />
          {selectedIndex + 1} / {displayImages.length}
        </div>

        {/* Zoom hint */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5" />
          Click to expand
        </div>

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot navigation */}
        {displayImages.length > 1 && displayImages.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === selectedIndex ? 'bg-white w-4' : 'bg-white bg-opacity-60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 gallery-thumbnail ${i === selectedIndex ? 'selected' : ''}`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-colors"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <img
            src={displayImages[selectedIndex]?.url || PLACEHOLDER}
            alt={`${title} - Photo ${selectedIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-colors"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1.5 rounded-full">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImages;
