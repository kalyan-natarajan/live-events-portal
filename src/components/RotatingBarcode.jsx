import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Smartphone, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { generateBarcodePattern, generateRotatingCode } from '../utils/helpers';

export default function RotatingBarcode({ ticket, isOffline = false }) {
  const [barcode, setBarcode] = useState(() => generateBarcodePattern());
  const [code, setCode] = useState(() => generateRotatingCode());
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRotating, setIsRotating] = useState(false);

  const rotate = useCallback(() => {
    setIsRotating(true);
    setTimeout(() => {
      setBarcode(generateBarcodePattern());
      setCode(generateRotatingCode());
      setTimeLeft(30);
      setIsRotating(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (isOffline) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          rotate();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOffline, rotate]);

  return (
    <div className="bg-white rounded-2xl p-6 text-center">
      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        <span className="text-sm font-semibold text-green-700">Secure Entry Pass</span>
        {isOffline ? (
          <div className="flex items-center gap-1 ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
            <WifiOff className="w-3 h-3" />
            Offline
          </div>
        ) : (
          <div className="flex items-center gap-1 ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
            <Wifi className="w-3 h-3" />
            Live
          </div>
        )}
      </div>

      {/* Barcode */}
      <div className={`flex items-end justify-center gap-[1px] h-20 mb-3 ${isRotating ? 'rotate-enter' : ''}`}>
        {barcode.map((bar, i) => (
          <div
            key={i}
            className="bg-black rounded-sm"
            style={{
              width: bar.width,
              height: bar.filled ? `${40 + Math.random() * 40}%` : '20%',
              opacity: bar.filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Rotating code */}
      <div className={`font-mono text-lg font-bold text-gray-900 tracking-[0.3em] mb-2 ${isRotating ? 'rotate-enter' : ''}`}>
        {code.match(/.{1,4}/g)?.join(' ')}
      </div>

      {/* Timer */}
      {!isOffline && (
        <div className="mb-4">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(timeLeft / 30) * 100}%`,
                backgroundColor: timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Refreshes in {timeLeft}s
          </p>
        </div>
      )}

      {/* Ticket info on barcode */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <p className="font-mono">{ticket.barcodeData}</p>
        <p>{ticket.section} &middot; Row {ticket.row} &middot; Seat {ticket.seat}</p>
      </div>

      {/* Warning */}
      <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <p className="font-semibold">Screenshots will not be accepted</p>
          <p className="mt-0.5">This barcode rotates for security. Use this app or add to your mobile wallet for entry.</p>
        </div>
      </div>

      {/* Wallet buttons */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Smartphone className="w-4 h-4" />
          Apple Wallet
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
          <Smartphone className="w-4 h-4" />
          Google Wallet
        </button>
      </div>
    </div>
  );
}
