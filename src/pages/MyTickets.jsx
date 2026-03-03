import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, WifiOff, Wifi, ChevronRight, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime, daysUntil } from '../utils/helpers';

export default function MyTickets() {
  const { state, dispatch } = useApp();
  const { tickets } = state;

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const pastTickets = tickets.filter((t) => t.status === 'used' || t.status === 'expired');

  const handleSaveOffline = (ticket) => {
    dispatch({ type: 'SAVE_OFFLINE', payload: ticket });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-400 mb-2">No tickets yet</h2>
        <p className="text-gray-600 text-sm mb-6">
          Browse events and purchase tickets to see them here
        </p>
        <Link
          to="/search"
          className="inline-block bg-primary-light hover:bg-primary text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Find Events
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Tickets</h1>
        <span className="bg-primary-light/20 text-primary-light text-xs font-bold px-3 py-1 rounded-full">
          {activeTickets.length} active
        </span>
      </div>

      {/* Offline access info */}
      <div className="bg-surface border border-gray-800 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-light/10 rounded-lg flex items-center justify-center shrink-0">
          <WifiOff className="w-5 h-5 text-primary-light" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Offline Access</h3>
          <p className="text-xs text-gray-400 mt-1">
            Viewed tickets are automatically saved for offline use. You can also manually save tickets below.
          </p>
        </div>
      </div>

      {/* Active tickets */}
      {activeTickets.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Upcoming
          </h2>
          {activeTickets.map((ticket) => {
            const days = daysUntil(ticket.event.date);
            return (
              <Link
                key={ticket.id}
                to={`/ticket/${ticket.id}`}
                className="block bg-surface rounded-xl border border-gray-800 hover:border-primary-light/30 transition-all overflow-hidden"
              >
                <div className="flex">
                  {/* Event image */}
                  <div className="w-24 md:w-36 shrink-0">
                    <img
                      src={ticket.event.image}
                      alt={ticket.event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Ticket info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm line-clamp-1">
                          {ticket.event.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 ml-2" />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ticket.event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ticket.event.venue.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {ticket.section} &middot; Row {ticket.row} &middot; Seat {ticket.seat}
                        </span>
                        {/* Offline status */}
                        {ticket.offlineSaved ? (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <Wifi className="w-3 h-3" />
                            Saved
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSaveOffline(ticket);
                            }}
                            className="flex items-center gap-1 text-xs text-primary-light hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            Save offline
                          </button>
                        )}
                      </div>
                      {days > 0 && (
                        <span className={`text-xs font-medium ${days <= 3 ? 'text-accent' : 'text-gray-500'}`}>
                          {days}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Past tickets */}
      {pastTickets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Past</h2>
          {pastTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-surface rounded-xl border border-gray-800 p-4 opacity-60"
            >
              <h3 className="font-medium text-gray-300 text-sm">{ticket.event.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(ticket.event.date)} &middot; {ticket.section}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
