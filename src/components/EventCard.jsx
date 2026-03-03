import { Link } from 'react-router-dom';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, daysUntil } from '../utils/helpers';

export default function EventCard({ event, featured = false }) {
  const days = daysUntil(event.date);

  return (
    <Link
      to={`/event/${event.id}`}
      className={`group block bg-surface rounded-xl overflow-hidden border border-gray-800 hover:border-primary-light/50 transition-all hover:shadow-lg hover:shadow-primary-light/5 ${
        featured ? 'md:flex' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? 'md:w-1/2' : 'aspect-[16/9]'}`}>
        <img
          src={event.image}
          alt={event.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            featured ? 'aspect-[16/9] md:aspect-auto md:h-full' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {event.trending && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-accent/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            Trending
          </div>
        )}
        {days > 0 && days <= 7 && (
          <div className="absolute top-3 right-3 bg-danger/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {days}d left
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block bg-gray-900/80 text-xs text-gray-300 px-2 py-1 rounded-md uppercase tracking-wider">
            {event.category}
          </span>
        </div>
      </div>
      <div className={`p-4 ${featured ? 'md:w-1/2 md:p-6 md:flex md:flex-col md:justify-center' : ''}`}>
        <h3 className={`font-bold text-white group-hover:text-primary-light transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
          {event.title}
        </h3>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4 shrink-0" />
            {formatDate(event.date)} &middot; {formatTime(event.date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 shrink-0" />
            {event.venue.name}, {event.venue.city}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-accent">
            {formatCurrency(event.priceRange.min)} – {formatCurrency(event.priceRange.max)}
          </span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
            View Tickets
          </span>
        </div>
      </div>
    </Link>
  );
}
