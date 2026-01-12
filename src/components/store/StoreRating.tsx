import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StoreRatingProps {
  rating: number;
  size?: number;
}

const StoreRating: React.FC<StoreRatingProps> = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="currentColor" />
      ))}
      {hasHalfStar && <StarHalf size={size} fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
      <span className="ml-1 text-xs text-gray-600 font-medium">({rating.toFixed(1)})</span>
    </div>
  );
};

export default StoreRating;