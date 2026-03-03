import { useState } from 'react';
import { X, Send, Mail, MessageSquare, DollarSign, ArrowRight, Check } from 'lucide-react';

export default function TransferModal({ ticket, onClose, mode = 'transfer' }) {
  const [method, setMethod] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [listPrice, setListPrice] = useState(ticket.price.toString());
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {mode === 'transfer' ? 'Transfer Initiated!' : 'Listed for Sale!'}
          </h3>
          <p className="text-gray-400 text-sm">
            {mode === 'transfer'
              ? `Your ticket transfer to ${recipient} is being processed.`
              : `Your ticket has been listed at $${listPrice}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">
            {mode === 'transfer' ? 'Transfer Ticket' : 'List for Sale'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Ticket summary */}
          <div className="bg-gray-900 rounded-lg p-4 mb-5">
            <p className="font-medium text-white text-sm">{ticket.event.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {ticket.section} &middot; Row {ticket.row} &middot; Seat {ticket.seat}
            </p>
          </div>

          {mode === 'transfer' ? (
            <>
              {/* Transfer method */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Send via
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      method === 'email'
                        ? 'border-primary-light bg-primary-light/10 text-primary-light'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('text')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      method === 'text'
                        ? 'border-primary-light bg-primary-light/10 text-primary-light'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Text
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  {method === 'email' ? 'Recipient Email' : 'Phone Number'}
                </label>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={method === 'email' ? 'friend@email.com' : '(555) 123-4567'}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light"
                />
              </div>
            </>
          ) : (
            <>
              {/* List price */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Listing Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    min="1"
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Original price: ${ticket.price} &middot; Marketplace fee: 15%
                </p>
                <div className="mt-3 bg-gray-900 rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">You&apos;ll receive</span>
                  <span className="text-success font-bold">
                    ${Math.round(listPrice * 0.85)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary-light hover:bg-primary text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {mode === 'transfer' ? (
              <>
                <Send className="w-4 h-4" />
                Send Transfer
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                List for Sale
              </>
            )}
          </button>

          {mode === 'transfer' && (
            <p className="text-xs text-gray-500 text-center mt-3">
              The recipient will receive an email/text with instructions to claim the ticket.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
