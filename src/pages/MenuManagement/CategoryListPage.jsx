import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import CategoryListPanel from '../../components/CategoryListPanel';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const { activeRestaurant, updateMenuCategories } = useAppState();

  if (!activeRestaurant) return null;

  const defaultCategories = ['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'];
  const categories = activeRestaurant.categories || defaultCategories;

  return (
    <CategoryListPanel
      categories={categories}
      onBack={() => navigate('/menu')}
      onUpdateCategories={(newCats) => {
        if (updateMenuCategories) updateMenuCategories(activeRestaurant.id, newCats);
      }}
      activeRestaurant={activeRestaurant}
    />
  );
}
