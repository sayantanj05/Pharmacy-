import { useEffect, useState } from 'react';

/**
 * Returns a token that changes whenever the tab regains focus or becomes visible again.
 *
 * Shop owner data is mutated by the super admin (e.g. fulfilling a procurement request),
 * so pages that fetch on mount would otherwise show stale numbers until a manual reload.
 * Include the token in your effect dependency array to refetch when the user comes back.
 */
const useRefreshOnFocus = () => {
  const [token, setToken] = useState(0);

  useEffect(() => {
    const bump = () => {
      if (document.visibilityState === 'visible') {
        setToken((value) => value + 1);
      }
    };

    window.addEventListener('focus', bump);
    document.addEventListener('visibilitychange', bump);

    return () => {
      window.removeEventListener('focus', bump);
      document.removeEventListener('visibilitychange', bump);
    };
  }, []);

  return token;
};

export default useRefreshOnFocus;