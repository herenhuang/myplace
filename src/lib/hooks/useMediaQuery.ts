import { useState, useEffect } from 'react';

const useMediaQuery = (query: string = '') => {
  const [matches, setMatches] = useState(
    window.matchMedia(query).matches
  );

  useEffect(() => {
    window
    .matchMedia(query)
    .addEventListener('change', e => setMatches( e.matches ));

    return () => {
      window
      .matchMedia(query)
      .removeEventListener('change', e => setMatches( e.matches ));
    };
  }, []);

  return matches;
}

export default useMediaQuery;