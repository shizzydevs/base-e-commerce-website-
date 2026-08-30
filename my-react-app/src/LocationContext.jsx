import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LocationContext } from './locationContextObject';

export const LocationProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('user_city') || '';
  });
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setCities(data);
        if (!selectedCity && data.length > 0) {
          const defaultCity = data.find(c => c.slug === 'beirut') || data[0];
          setSelectedCity(defaultCity.id);
          localStorage.setItem('user_city', defaultCity.id);
        }
      }
      setLoadingCities(false);
    }
    fetchCities();
  }, [selectedCity]);

  const changeCity = (cityId) => {
    setSelectedCity(cityId);
    localStorage.setItem('user_city', cityId);
  };

  return (
    <LocationContext.Provider value={{ cities, selectedCity, changeCity, loadingCities }}>
      {children}
    </LocationContext.Provider>
  );
};
//hello