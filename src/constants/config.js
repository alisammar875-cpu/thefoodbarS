// ══════════════════════════════════════════════════════
//  THE FOOD BAR — App Configuration Constants
// ══════════════════════════════════════════════════════

// ImgBB — Free image hosting (https://api.imgbb.com)
// Sign up at https://imgbb.com → API tab → Get free key
export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY_HERE";

// EmailJS — Transactional emails (https://www.emailjs.com)
// Create free account → Email Services → Create Service → Email Templates → Create Template
export const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

// App-level constants
export const DELIVERY_FEE = 100; // PKR
export const ESTIMATED_DELIVERY = "30-45 minutes";
export const LOYALTY_RATE = 10; // points per PKR 100 spent

// Order Status flow
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
];

export const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/30' },
  preparing: { bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/30' },
  out_for_delivery: { bg: 'bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/30' },
  delivered: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' },
};
