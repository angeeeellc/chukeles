import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor durante `delay` ms.
 * Útil para evitar llamadas excesivas al buscar por nombre.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
