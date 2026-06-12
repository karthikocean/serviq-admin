import React from 'react';
import { useAppState } from '../../config/AppContext';
import SettingsPanel from '../../components/SettingsPanel';
import './Settings.css';

export default function Settings() {
  const {
    activeRestaurant,
    saveRestaurantSettings,
    accentColor,
    setAccentColor,
    darkMode,
    setDarkMode
  } = useAppState();

  if (!activeRestaurant) return null;

  return (
    <SettingsPanel
      activeRestaurant={activeRestaurant}
      saveRestaurantSettings={saveRestaurantSettings}
      accentColor={accentColor}
      setAccentColor={setAccentColor}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}
