import { useState, useCallback } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Unable to read localStorage key "${key}".`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStoredValue((currentValue) => {
      const valueToStore = value instanceof Function ? value(currentValue) : value;

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Unable to write localStorage key "${key}".`, error);
        }
      }

      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}
