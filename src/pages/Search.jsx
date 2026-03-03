import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X, MapPin, Calendar } from 'lucide-react';
import { events, categories, venues } from '../data/mockData';
import EventCard from '../components/EventCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showFilters, setShowFilters] = useState(!!initialCategory);

  const cities = [...new Set(venues.map((v) => v.city))].sort();

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (query) {
        const q = query.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchVenue = event.venue.name.toLowerCase().includes(q);
        const matchArtist = event.artist?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchVenue && !matchArtist) return false;
      }
      if (selectedCategory && event.category !== selectedCategory) return false;
      if (selectedCity && event.venue.city !== selectedCity) return false;
      if (dateRange) {
        const eventDate = new Date(event.date);
        const now = new Date();
        if (dateRange === 'week') {
          const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (eventDate > weekLater) return false;
        } else if (dateRange === 'month') {
          const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (eventDate > monthLater) return false;
        } else if (dateRange === '3months') {
          const threeLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          if (eventDate > threeLater) return false;
        }
      }
      return true;
    });
  }, [query, selectedCategory, selectedCity, dateRange]);

  const hasFilters = selectedCategory || selectedCity || dateRange;

  return (
    <div className="pb-20 md:pb-6">
      {/* Search bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, artists, venues..."
          className="w-full bg-surface border border-gray-800 rounded-xl pl-12 pr-12 py-3.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
            showFilters || hasFilters
              ? 'bg-primary-light/20 text-primary-light'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface border border-gray-800 rounded-xl p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCity('');
                  setDateRange('');
                }}
                className="text-xs text-primary-light hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* City filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </label>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCity === city
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Date filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: '3months', label: 'Next 3 Months' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(dateRange === d.id ? '' : d.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    dateRange === d.id
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters pills */}
      {hasFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <span className="flex items-center gap-1 bg-primary-light/20 text-primary-light text-xs px-2.5 py-1 rounded-full">
              {categories.find((c) => c.id === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCity && (
            <span className="flex items-center gap-1 bg-primary-light/20 text-primary-light text-xs px-2.5 py-1 rounded-full">
              {selectedCity}
              <button onClick={() => setSelectedCity('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {dateRange && (
            <span className="flex items-center gap-1 bg-primary-light/20 text-primary-light text-xs px-2.5 py-1 rounded-full">
              {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : '3 Months'}
              <button onClick={() => setDateRange('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No events found</h3>
          <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
