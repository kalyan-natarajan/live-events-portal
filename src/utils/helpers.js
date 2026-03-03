export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function daysUntil(dateStr) {
  const now = new Date();
  const event = new Date(dateStr);
  const diff = event - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateBarcodePattern() {
  const bars = [];
  for (let i = 0; i < 60; i++) {
    bars.push({
      width: Math.random() > 0.5 ? 2 : 1,
      filled: Math.random() > 0.3,
    });
  }
  return bars;
}

export function generateRotatingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
