import React, { useState } from 'react';
import { DEFAULT_IMAGES } from '../../constants';

export default function FallbackImage({ src, alt, category = 'OTHER', className }) {
  const [error, setError] = useState(false);
  const defaultImage = DEFAULT_IMAGES[category] || DEFAULT_IMAGES.OTHER;

  return (
    <img
      src={error ? defaultImage : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
} 