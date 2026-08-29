import { MapPin } from 'lucide-react';
import { useLocation } from './useLocation';

export default function CityModal({ isOpen, onClose }) {
  const { cities, selectedCity, changeCity } = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-800 border border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <MapPin className="w-6 h-6" />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-1">Select Your City</h2>
        <p className="text-xs text-stone-400 mb-6">
          Choose a city to see stores with local delivery options available near you.
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                changeCity(city.id);
                onClose();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                selectedCity === city.id
                  ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md'
                  : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}