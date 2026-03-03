import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Clock, Send, DollarSign,
  Download, WifiOff, Wifi, Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime, formatDateTime } from '../utils/helpers';
import RotatingBarcode from '../components/RotatingBarcode';
import TransferModal from '../components/TransferModal';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const ticket = state.tickets.find((t) => t.id === id);

  const [showTransfer, setShowTransfer] = useState(false);
  const [showResale, setShowResale] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Auto-save for offline when viewed
  useEffect(() => {
    if (ticket && !ticket.offlineSaved) {
      dispatch({ type: 'SAVE_OFFLINE', payload: ticket });
    }
  }, [ticket, dispatch]);

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-gray-400">Ticket not found</h2>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-primary-light hover:underline">
          Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-20 md:pb-6">
      {/* Back */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        My Tickets
      </button>

      {/* Event header */}
      <div className="bg-surface rounded-t-2xl overflow-hidden">
        <div className="relative h-40">
          <img
            src={ticket.event.image}
            alt={ticket.event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-lg font-bold text-white">{ticket.event.title}</h1>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(ticket.event.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(ticket.event.date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {ticket.event.venue.name}
            </span>
          </div>

          {/* Seat info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary-light/20 text-primary-light px-3 py-1 rounded-full font-medium">
              {ticket.section}
            </span>
            <span className="text-gray-300">
              Row {ticket.row} &middot; Seat {ticket.seat}
            </span>
          </div>

          {/* Offline status badge */}
          <div className="flex items-center gap-2 pt-1">
            {ticket.offlineSaved ? (
              <div className="flex items-center gap-1.5 bg-success/10 text-success text-xs px-3 py-1.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                Available Offline
              </div>
            ) : (
              <button
                onClick={() => dispatch({ type: 'SAVE_OFFLINE', payload: ticket })}
                className="flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                Save for Offline
              </button>
            )}
            <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-success' : 'text-warning'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Dashed divider */}
      <div className="relative h-6 bg-surface">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-950" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-gray-950" />
        <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-gray-800" />
      </div>

      {/* Barcode section */}
      <div className="bg-surface rounded-b-2xl p-4">
        <RotatingBarcode ticket={ticket} isOffline={!isOnline} />
      </div>

      {/* Security info */}
      <div className="mt-4 bg-surface rounded-xl border border-gray-800 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-white">Secure Entry</h3>
          <p className="text-xs text-gray-400 mt-1">
            This ticket uses a rotating barcode that refreshes every 30 seconds. For added security,
            add to Apple Wallet or Google Wallet. Screenshots are not valid for entry.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ticket.transferable && (
          <button
            onClick={() => setShowTransfer(true)}
            className="flex items-center justify-center gap-2 bg-surface border border-gray-800 hover:border-primary-light/50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Transfer
          </button>
        )}
        {ticket.resellable && (
          <button
            onClick={() => setShowResale(true)}
            className="flex items-center justify-center gap-2 bg-surface border border-gray-800 hover:border-accent/50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Sell
          </button>
        )}
      </div>

      {/* Ticket details */}
      <div className="mt-4 bg-surface rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Ticket Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Order Date</span>
            <span className="text-gray-300">{formatDateTime(ticket.purchaseDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ticket ID</span>
            <span className="text-gray-300 font-mono">{ticket.barcodeData}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Face Value</span>
            <span className="text-gray-300">${ticket.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-success capitalize">{ticket.status}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTransfer && (
        <TransferModal
          ticket={ticket}
          onClose={() => setShowTransfer(false)}
          mode="transfer"
        />
      )}
      {showResale && (
        <TransferModal
          ticket={ticket}
          onClose={() => setShowResale(false)}
          mode="resale"
        />
      )}
    </div>
  );
}
