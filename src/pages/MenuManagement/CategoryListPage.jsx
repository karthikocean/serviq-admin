import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import CategoryListPanel from '../../components/CategoryListPanel';
import MenuApi from '../../api/Menu';
import { isBranchMatch, isBranchFilterActive } from '../../helper/BranchHelper';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const { activeRestaurant, selectedBranchId } = useAppState();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const isBranchFiltered = isBranchFilterActive(selectedBranchId);
    const params = { page: 0, limit: 10 };
    if (isBranchFiltered) {
      params.branchId = selectedBranchId;
    }
    const res = await MenuApi.getCategories(params);
    if (res?.status && res.response) {
      let catArray = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
      if (isBranchFiltered) {
        catArray = catArray.filter(c => isBranchMatch(c, selectedBranchId, activeRestaurant?.branches || []));
      }
      setCategories(catArray);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeRestaurant, selectedBranchId]);

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
