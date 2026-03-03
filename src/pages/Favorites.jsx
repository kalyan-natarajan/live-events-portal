import { useMemo } from 'react';
import { Heart, Music, Trophy, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { artists, teams, venues, events } from '../data/mockData';
import EventCard from '../components/EventCard';

export default function Favorites() {
  const { state, dispatch } = useApp();

  const favArtists = useMemo(
    () => artists.filter((a) => state.favorites.artists.includes(a.id)),
    [state.favorites.artists]
  );
  const favTeams = useMemo(
    () => teams.filter((t) => state.favorites.teams.includes(t.id)),
    [state.favorites.teams]
  );
  const favVenues = useMemo(
    () => venues.filter((v) => state.favorites.venues.includes(v.id)),
    [state.favorites.venues]
  );

  const allArtists = artists;
  const allTeams = teams;
  const allVenues = venues;

  const recommended = useMemo(() => {
    return events.filter((e) => {
      if (e.artist && state.favorites.artists.includes(e.artist.id)) return true;
      if (e.team && state.favorites.teams.includes(e.team.id)) return true;
      if (state.favorites.venues.includes(e.venue.id)) return true;
      return false;
    });
  }, [state.favorites]);

  const toggleFav = (category, id) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { category, id } });
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-400" />
        <h1 className="text-2xl font-bold text-white">Favorites</h1>
      </div>

      <p className="text-sm text-gray-400 mb-8">
        Favorite your preferred artists, teams, and venues to get personalized event recommendations.
      </p>

      {/* Artists */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
          <Music className="w-5 h-5 text-primary-light" />
          Artists
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allArtists.map((artist) => {
            const isFav = state.favorites.artists.includes(artist.id);
            return (
              <button
                key={artist.id}
                onClick={() => toggleFav('artists', artist.id)}
                className={`relative group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isFav
                    ? 'bg-primary-light/10 border-primary-light/30'
                    : 'bg-surface border-gray-800 hover:border-gray-700'
                }`}
              >
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{artist.name}</p>
                  <p className="text-xs text-gray-500">{artist.genre}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'text-red-400 fill-red-400' : 'text-gray-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Teams */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          Teams
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allTeams.map((team) => {
            const isFav = state.favorites.teams.includes(team.id);
            return (
              <button
                key={team.id}
                onClick={() => toggleFav('teams', team.id)}
                className={`relative group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isFav
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-surface border-gray-800 hover:border-gray-700'
                }`}
              >
                <img
                  src={team.image}
                  alt={team.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{team.name}</p>
                  <p className="text-xs text-gray-500">{team.sport}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'text-red-400 fill-red-400' : 'text-gray-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Venues */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
          <MapPin className="w-5 h-5 text-success" />
          Venues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allVenues.map((venue) => {
            const isFav = state.favorites.venues.includes(venue.id);
            return (
              <button
                key={venue.id}
                onClick={() => toggleFav('venues', venue.id)}
                className={`relative group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isFav
                    ? 'bg-success/10 border-success/30'
                    : 'bg-surface border-gray-800 hover:border-gray-700'
                }`}
              >
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{venue.name}</p>
                  <p className="text-xs text-gray-500">
                    {venue.city}, {venue.state} &middot; {venue.capacity.toLocaleString()} cap
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'text-red-400 fill-red-400' : 'text-gray-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recommended from favorites */}
      {recommended.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            Events from Your Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
