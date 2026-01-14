import type { ItemCategory } from '@/types';

export interface CategoryInfo {
  id: ItemCategory;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'electronics', label: 'Eletrônicos', icon: 'desktopcomputer' },
  { id: 'clothing', label: 'Roupas', icon: 'tshirt' },
  { id: 'furniture', label: 'Móveis', icon: 'bed.double' },
  { id: 'books', label: 'Livros', icon: 'book' },
  { id: 'sports', label: 'Esportes', icon: 'sportscourt' },
  { id: 'toys', label: 'Brinquedos', icon: 'gamecontroller' },
  { id: 'home', label: 'Casa', icon: 'house' },
  { id: 'other', label: 'Outros', icon: 'square.grid.2x2' },
];

export const getCategoryLabel = (categoryId: ItemCategory): string => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category?.label ?? 'Outros';
};

export const getCategoryIcon = (categoryId: ItemCategory): string => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon ?? 'square.grid.2x2';
};
