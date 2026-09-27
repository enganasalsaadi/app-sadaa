import { useState } from 'react';

export const useRatingStarsDemo = () => {
  const [rating, setRating] = useState(0);
  return { rating, setRating };
};
