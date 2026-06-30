import { createContext, useContext, useState, type ReactNode } from "react";

export interface SavedRoute {
  id: string;
  title: string;
  emoji: string;
  type: "recommended" | "mystery" | "custom";
  duration?: string;
  stops: string[];
  bg: string;
  tagBg: string;
  tagLabel: string;
  guidedTour?: {
    title: string;
    subtitle?: string;
    points: Array<{
      id: string;
      label: string;
      x?: number;
      y?: number;
    }>;
  };
}

interface FavoritesCtx {
  favorites: SavedRoute[];
  addFavorite: (r: SavedRoute) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (r: SavedRoute) => void;
}

const FavoritesContext = createContext<FavoritesCtx>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // 默认不预置任何“已收藏路线”，避免首次进入就显示已收藏数据
  const [favorites, setFavorites] = useState<SavedRoute[]>([]);

  const addFavorite = (r: SavedRoute) =>
    setFavorites((prev) => (prev.find((f) => f.id === r.id) ? prev : [...prev, r]));

  const removeFavorite = (id: string) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (r: SavedRoute) =>
    isFavorite(r.id) ? removeFavorite(r.id) : addFavorite(r);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
