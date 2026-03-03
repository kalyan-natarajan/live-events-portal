import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Heart, Share2, ArrowLeft,
  ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { events } from '../data/mockData';
import { formatDate, formatTime, formatCurrency, daysUntil } from '../utils/helpers';
import SeatMap from '../components/SeatMap';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const event = useMemo(() => events.find((e) => e.id === id), [id]);

  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(2);
  const [showDetails, setShowDetails] = useState(false);
  const [purchased, setPurchased] = useState(false);

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-gray-400">Event not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-light hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  const days = daysUntil(event.date);
  const isFavorited = event.artist
    ? state.favorites.artists.includes(event.artist.id)
    : event.team
    ? state.favorites.teams.includes(event.team.id)
    : false;

  const handleFavorite = () => {
    if (event.artist) {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: { category: 'artists', id: event.artist.id } });
    } else if (event.team) {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: { category: 'teams', id: event.team.id } });
    }
  };

  const handlePurchase = () => {
    if (!selectedSection) return;
    for (let i = 0; i < quantity; i++) {
      const seat = Math.floor(Math.random() * 30) + 1;
      const row = String.fromCharCode(65 + Math.floor(Math.random() * 10));
      const ticket = {
        id: `tk-${Date.now()}-${i}`,
        eventId: event.id,
        event,
        section: selectedSection.name,
        row,
        seat: seat.toString(),
        purchaseDate: new Date().toISOString(),
        price: selectedSection.price,
        status: 'active',
        barcodeData: `TK-${event.id}-${selectedSection.name.substring(0, 3).toUpperCase()}${row}${seat}`,
        offlineSaved: false,
        transferable: true,
        resellable: true,
      };
      dispatch({ type: 'ADD_TICKET', payload: ticket });
    }
    setPurchased(true);
  };

  if (purchased) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Tickets Purchased!</h2>
        <p className="text-gray-400 mb-2">
          {quantity}x {selectedSection?.name} for {event.title}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Your tickets are now available in My Tickets.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/tickets')}
            className="bg-primary-light hover:bg-primary text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View My Tickets
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block bg-primary-light/20 text-primary-light text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            {event.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info bar */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-gray-300">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-gray-300">{formatTime(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-gray-300">
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
            {days > 0 && (
              <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
                <span className="text-sm text-accent font-medium">{days} days away</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isFavorited
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-surface text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-400' : ''}`} />
              {isFavorited ? 'Favorited' : 'Favorite'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface text-gray-400 hover:text-white text-sm font-medium transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Description */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-semibold text-white mb-2"
            >
              About this event
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDetails && (
              <p className="text-sm text-gray-400 leading-relaxed">{event.description}</p>
            )}
          </div>

          {/* Seat Map */}
          <SeatMap sections={event.sections} onSelectSection={setSelectedSection} />
        </div>

        {/* Right: purchase card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-1">Get Tickets</h3>
            <p className="text-sm text-gray-400 mb-5">
              {formatCurrency(event.priceRange.min)} – {formatCurrency(event.priceRange.max)}
            </p>

            {selectedSection ? (
              <>
                {/* Selected section */}
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedSection.color }}
                    />
                    <span className="font-medium text-white text-sm">
                      {selectedSection.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {selectedSection.available} seats available
                    </span>
                    <span className="text-white font-bold">
                      {formatCurrency(selectedSection.price)}/ea
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-300">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(8, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-800 pt-4 mb-5">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedSection.price * quantity)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Service Fee</span>
                    <span>{formatCurrency(Math.round(selectedSection.price * quantity * 0.15))}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white mt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(Math.round(selectedSection.price * quantity * 1.15))}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="w-full flex items-center justify-center gap-2 bg-primary-light hover:bg-primary text-white font-bold py-3.5 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Purchase Tickets
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Select a section from the seat map to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
