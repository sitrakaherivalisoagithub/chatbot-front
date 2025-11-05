'use client';

import { useState } from 'react';

type ImageMessageProps = {
  src: string;
};

export default function ImageMessage({ src }: ImageMessageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'image.png'; // You can generate a more specific name if needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <img
        src={src}
        alt="Visualisation"
        className="block w-full h-auto cursor-pointer"
        onClick={() => setIsZoomed(true)}
      />
      <button
        onClick={handleDownload}
        className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsZoomed(false)}
        >
          <img src={src} alt="Visualisation zoomée" className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
}
