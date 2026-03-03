import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, ChevronRight, Music, Trophy, Theater, Laugh, PartyPopper, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { events, artists, categories } from '../data/mockData';
import EventCard from '../components/EventCard';

const iconMap = { Music, Trophy, Theater: Theater, Laugh, PartyPopper, Users };

export default function Home() {
  const { state } = useApp();

  const featuredEvents = useMemo(() => events.filter((e) => e.featured), []);
  const trendingEvents = useMemo(() => events.filter((e) => e.trending), []);

  const recommended = useMemo(() => {
    return events.filter((e) => {
      if (e.artist && state.favorites.artists.includes(e.artist.id)) return true;
      if (e.team && state.favorites.teams.includes(e.team.id)) return true;
      if (state.favorites.venues.includes(e.venue.id)) return true;
      return false;
    });
  }, [state.favorites]);

  return (
    <div className="space-y-10 pb-20 md:pb-6">
      {/* Hero */}
      <section>
        <div className="relative bg-gradient-to-br from-primary-dark via-surface to-surface rounded-2xl overflow-hidden p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="relative">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Your Live Event<br />
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Experience Starts Here
              </span>
            </h1>
            <p className="mt-4 text-gray-400 text-base md:text-lg max-w-xl">
              Discover events, secure your tickets, and walk through the door — all from one app.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/search"
                className="bg-primary-light hover:bg-primary text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Find Events
              </Link>
              <Link
                to="/tickets"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
              >
                My Tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Browse by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Music;
            return (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="flex flex-col items-center gap-2 p-4 bg-surface rounded-xl border border-gray-800 hover:border-primary-light/50 transition-all group"
              >
                <div className="w-10 h-10 bg-primary-light/10 rounded-lg flex items-center justify-center group-hover:bg-primary-light/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary-light" />
                </div>
                <span className="text-xs font-medium text-gray-300">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Personalized Recommendations */}
      {recommended.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-white">For You</h2>
            </div>
            <Link to="/favorites" className="text-sm text-primary-light hover:underline flex items-center gap-1">
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Event */}
      {featuredEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Featured</h2>
          <EventCard event={featuredEvents[0]} featured />
        </section>
      )}

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-white">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* All Events */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
