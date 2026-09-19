import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const SAVED_KEY = 'phcityrent_saved';

interface SavedPropertiesValue {
  saved: string[];
  toggleSave: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  isLoaded: boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesValue | null>(null);

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(SAVED_KEY)
      .then((raw) => {
        if (!cancelled && raw) setSaved(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(saved)).catch(() => {});
  }, [saved, isLoaded]);

  const toggleSave = useCallback((propertyId: string) => {
    setSaved((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const isSaved = useCallback((propertyId: string) => saved.includes(propertyId), [saved]);

  return (
    <SavedPropertiesContext.Provider value={{ saved, toggleSave, isSaved, isLoaded }}>
      {children}
    </SavedPropertiesContext.Provider>
  );
}

export function useSavedProperties() {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within SavedPropertiesProvider');
  }
  return context;
}
