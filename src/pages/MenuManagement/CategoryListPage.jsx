import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import CategoryListPanel from '../../components/CategoryListPanel';
import MenuApi from '../../api/Menu';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const { activeRestaurant } = useAppState();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await MenuApi.getCategories({ limit: 1000 });
    if (res?.status && res.response) {
      const catArray = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
      setCategories(catArray);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeRestaurant]);

  if (!activeRestaurant) return null;

  return (
    <CategoryListPanel
      categories={categories}
      onBack={() => navigate('/menu')}
      refreshCategories={fetchCategories}
      activeRestaurant={activeRestaurant}
    />
  );
}
