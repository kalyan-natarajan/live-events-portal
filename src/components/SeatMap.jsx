import { useState } from 'react';
import { formatCurrency } from '../utils/helpers';

export default function SeatMap({ sections, onSelectSection }) {
  const [activeSection, setActiveSection] = useState(null);
  const [priceFilter, setPriceFilter] = useState([0, 1000]);

  const filteredSections = sections.filter(
    (s) => s.price >= priceFilter[0] && s.price <= priceFilter[1]
  );

  const maxPrice = Math.max(...sections.map((s) => s.price));
  const minPrice = Math.min(...sections.map((s) => s.price));

  return (
    <div className="bg-surface rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Select Your Seats</h3>

      {/* Price filter */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Price Range</span>
          <span>
            {formatCurrency(priceFilter[0])} – {formatCurrency(priceFilter[1])}
          </span>
        </div>
        <div className="flex gap-3">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceFilter[0]}
            onChange={(e) => setPriceFilter([+e.target.value, priceFilter[1]])}
            className="flex-1 accent-primary-light"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceFilter[1]}
            onChange={(e) => setPriceFilter([priceFilter[0], +e.target.value])}
            className="flex-1 accent-primary-light"
          />
        </div>
      </div>

      {/* Visual seat map */}
      <div className="relative bg-gray-900 rounded-xl p-6 mb-6">
        {/* Stage */}
        <div className="mx-auto w-48 h-8 bg-gradient-to-b from-primary-light/30 to-transparent rounded-t-full flex items-center justify-center mb-6">
          <span className="text-xs text-primary-light font-medium">STAGE</span>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {sections.map((section, idx) => {
            const isFiltered = filteredSections.includes(section);
            const isActive = activeSection === section.id;
            const widthPercent = 60 + idx * 10;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  onSelectSection(section);
                }}
                disabled={!isFiltered}
                className={`mx-auto block rounded-lg transition-all py-3 px-4 text-sm font-medium ${
                  !isFiltered
                    ? 'opacity-20 cursor-not-allowed bg-gray-800 text-gray-600'
                    : isActive
                    ? 'ring-2 ring-white shadow-lg scale-[1.02]'
                    : 'hover:scale-[1.01] hover:brightness-110 cursor-pointer'
                }`}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: isFiltered ? section.color + '33' : undefined,
                  borderLeft: isFiltered ? `3px solid ${section.color}` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: section.color }}
                    />
                    <span className={isFiltered ? 'text-white' : ''}>{section.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={isFiltered ? 'text-gray-300' : ''}>
                      {section.available} avail
                    </span>
                    <span className={`font-bold ${isFiltered ? 'text-white' : ''}`}>
                      {formatCurrency(section.price)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        {sections.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
