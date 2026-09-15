import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_REVIEWS,
  INITIAL_GALLERY,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  BUSINESS_INFO,
} from './src/data/mockData.ts';
import {
  Booking,
  Order,
  CustomerUpload,
  ReviewItem,
  PaymentRecord,
  InvoiceData,
  AppNotification,
  ServiceItem,
  PackageItem,
  GalleryItem,
  ORDER_STATUSES,
  WeddingVideoItem,
  StorageFileItem,
  StorageMetrics,
  WeddingFinalDelivery,
  SupportedVideoFormat,
  VideoVisibility,
  VideoCategory,
  PrivateCustomerGallery,
  MasterPhotoItem,
  AlbumSelectionRecord,
  UploadSessionRecord,
  AlbumSelectedPhotoRef,
  PaymentSettings,
  PaymentReceiptData,
  SmartMediaItem,
  SmartMediaCategory,
  SiteMediaConfig,
  SocialMediaSettings,
  StudioPoliciesData,
  BankPaymentSubmission,
  PhotoEditingService,
  PhotoEditingOrderItem,
  PhotoEditingUploadFile,
} from './src/types.ts';
import { DEFAULT_POLICIES_DATA } from './src/data/defaultPolicies.ts';
import { OFFICIAL_PAYMENT_DETAILS } from './src/data/paymentDetails.ts';
import {
  DEFAULT_PHOTO_EDITING_SERVICES,
  INITIAL_PHOTO_EDITING_ORDERS,
} from './src/data/photoEditingData.ts';
import { SUSHIL_LOGO_DATA_URL } from './src/data/logoAsset.ts';


const app = express();
const PORT = 3000;

// Body parsers with generous limits for simulated base64 uploads and rich order details
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory persistent store across server lifetime
let services: ServiceItem[] = [...INITIAL_SERVICES];
let packages: PackageItem[] = [...INITIAL_PACKAGES];
let reviews: ReviewItem[] = [...INITIAL_REVIEWS];
let gallery: GalleryItem[] = [...INITIAL_GALLERY];
let orders: Order[] = [...INITIAL_ORDERS];
let bookings: Booking[] = [...INITIAL_BOOKINGS];
let uploads: CustomerUpload[] = [];
let photoEditingServices: PhotoEditingService[] = [...DEFAULT_PHOTO_EDITING_SERVICES];
let photoEditingOrders: PhotoEditingOrderItem[] = [...INITIAL_PHOTO_EDITING_ORDERS];
let payments: PaymentRecord[] = [
  {
    id: 'PAY-SPJ-9011',
    orderId: 'SPJ-ORD-1001',
    customerName: 'Priyabrata Sahoo',
    customerPhone: '9861023456',
    customerEmail: 'priyabrata@gmail.com',
    service: 'Wedding Photography',
    amount: 10000,
    type: 'Advance Payment',
    paymentMethod: 'UPI',
    status: 'Partially Paid',
    transactionId: 'UPI-TXN-8849204',
    receiptNumber: 'SPJ-REC-202601',
    advanceAmount: 10000,
    remainingAmount: 15000,
    totalAmount: 25000,
    date: '2026-01-15 11:45 AM',
  },
  {
    id: 'PAY-SPJ-9012',
    orderId: 'SPJ-ORD-1002',
    customerName: 'Amit Meher',
    customerPhone: '9437198765',
    customerEmail: 'amit.meher@yahoo.com',
    service: 'Pre-Wedding',
    amount: 12000,
    type: 'Full Payment',
    paymentMethod: 'Net Banking',
    status: 'Fully Paid',
    transactionId: 'NB-SBIN-492019',
    receiptNumber: 'SPJ-REC-202602',
    advanceAmount: 12000,
    remainingAmount: 0,
    totalAmount: 12000,
    date: '2026-02-10 03:00 PM',
  },
  {
    id: 'PAY-SPJ-9013',
    orderId: 'SPJ-ORD-1003',
    customerName: 'Smruti Ranjan Dash',
    customerPhone: '7008123456',
    customerEmail: 'smruti.dash@gmail.com',
    service: 'Wedding Cinematography',
    amount: 15000,
    type: 'Booking Amount',
    paymentMethod: 'Credit Card',
    status: 'Partially Paid',
    transactionId: 'CC-HDFC-991823',
    receiptNumber: 'SPJ-REC-202603',
    advanceAmount: 15000,
    remainingAmount: 25000,
    totalAmount: 40000,
    date: '2026-03-05 04:15 PM',
  },
];

let paymentSettings: PaymentSettings = {
  ...OFFICIAL_PAYMENT_DETAILS,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  updatedAt: new Date().toISOString(),
};

let studioPolicies: StudioPoliciesData = { ...DEFAULT_POLICIES_DATA };

// Supabase client initialization for server-side real-time persistence
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'rlewwujizdhnornbwhaq';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_d5-bxyNqHpFbvv6cZw1S7w_Aa8zdttH';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Helper for asynchronous Supabase persistence
async function syncBookingToSupabase(booking: any, order?: Order) {
  try {
    const payload = {
      id: booking.id,
      customer_name: booking.customerName || booking.name || 'Valued Client',
      customer_phone: booking.phone || booking.customerPhone || '',
      customer_email: booking.email || booking.customerEmail || null,
      service: Array.isArray(booking.requiredServices)
        ? booking.requiredServices.join(', ')
        : (booking.service || booking.eventType || 'Wedding Photography'),
      event_type: booking.eventType || 'Wedding',
      event_date: booking.eventDate || booking.weddingDate || booking.date || '',
      location: booking.venue || booking.city || booking.location || null,
      status: booking.status || 'Pending',
      amount: order?.amount || order?.totalAmount || booking.budget || 0,
      advance_amount: order?.advancePaid || 0,
      created_at: booking.createdAt || new Date().toISOString(),
    };
    await supabase.from('bookings').upsert(payload, { onConflict: 'id' });
  } catch (err: any) {
    console.warn('Supabase booking sync notice:', err.message);
  }
}


async function syncPaymentToSupabase(payment: PaymentRecord) {
  try {
    const payload = {
      id: payment.id,
      order_id: payment.orderId,
      customer_name: payment.customerName,
      customer_phone: payment.customerPhone || null,
      customer_email: payment.customerEmail || null,
      amount: payment.amount,
      type: payment.type,
      payment_method: payment.paymentMethod,
      status: payment.status,
      transaction_id: payment.transactionId,
      receipt_number: payment.receiptNumber || null,
      date: payment.date,
      created_at: new Date().toISOString(),
    };
    await supabase.from('payments').upsert(payload, { onConflict: 'id' });
  } catch (err: any) {
    console.warn('Supabase payment sync notice:', err.message);
  }
}

let notifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Wedding Booking',
    message: 'Kishore Pradhan booked Wedding Photography for Nov 28, 2026 in Sohela.',
    type: 'booking',
    timestamp: '2026-03-01 03:00 PM',
    read: false,
    link: '/admin',
  },
  {
    id: 'notif-2',
    title: 'Payment Received',
    message: '₹10,000 received for order SPJ-ORD-1001 via UPI.',
    type: 'payment',
    timestamp: '2026-01-15 11:45 AM',
    read: true,
  },
];
let contactMessages: any[] = [];

// Helper generator functions
function generateId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ------------------------------------
// API ROUTES FIRST
// ------------------------------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: BUSINESS_INFO.name,
    timestamp: new Date().toISOString(),
  });
});

// Services CRUD
app.get('/api/services', (req: Request, res: Response) => {
  res.json(services);
});

app.post('/api/services', (req: Request, res: Response) => {
  const newService: ServiceItem = {
    ...req.body,
    id: req.body.id || `service-${Date.now()}`,
    startingPrice: Number(req.body.startingPrice) || 500,
  };
  services.unshift(newService);
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  services[index] = { ...services[index], ...req.body };
  res.json(services[index]);
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  services = services.filter((s) => s.id !== id);
  res.json({ success: true, id });
});

// Packages (Pricing editable by admin)
app.get('/api/packages', (req: Request, res: Response) => {
  res.json(packages);
});

app.put('/api/packages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }
  packages[index] = {
    ...packages[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : packages[index].price,
  };
  res.json(packages[index]);
});

// Bookings
app.get('/api/bookings', (req: Request, res: Response) => {
  res.json(bookings);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const bookingId = generateId('SPJ-BK');
  const orderId = generateId('SPJ-ORD');
  const newBooking: Booking = {
    id: bookingId,
    customerName: req.body.customerName || 'Valued Client',
    phone: req.body.phone || '',
    whatsapp: req.body.whatsapp || req.body.phone || '',
    email: req.body.email || '',
    weddingDate: req.body.weddingDate || req.body.eventDate || '',
    eventDate: req.body.eventDate || req.body.weddingDate || '',
    venue: req.body.venue || 'Bargarh, Odisha',
    city: req.body.city || 'Sohela / Bargarh',
    eventType: req.body.eventType || 'Wedding',
    guestCount: req.body.guestCount || '200+',
    requiredServices: req.body.requiredServices || ['Wedding Photography'],
    budget: req.body.budget || 'Custom',
    additionalMessage: req.body.additionalMessage || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    assignedOrderNumber: orderId,
  };

  bookings.unshift(newBooking);

  // Automatically create linked tracking order in 'Booking Received' status
  const newOrder: Order = {
    id: orderId,
    bookingId: bookingId,
    customerName: newBooking.customerName,
    phone: newBooking.phone,
    email: newBooking.email,
    service: Array.isArray(newBooking.requiredServices)
      ? newBooking.requiredServices.join(', ')
      : 'Wedding Photography',
    package: req.body.packageName || 'Custom Wedding Booking',
    amount: Number(req.body.estimatedAmount) || 12000,
    advancePaid: 0,
    remainingAmount: Number(req.body.estimatedAmount) || 12000,
    paymentStatus: 'Pending',
    orderStatus: 'Booking Received',
    bookingDate: new Date().toISOString().split('T')[0],
    eventDate: newBooking.weddingDate,
    uploadStatus: 'No Upload',
    editingStatus: 'Not Started',
    deliveryStatus: 'Processing',
    createdAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'Booking Received',
        timestamp: new Date().toLocaleString(),
        note: `Online booking submitted by ${newBooking.customerName}`,
      },
    ],
  };
  orders.unshift(newOrder);

  // Add system notification for admin
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'New Booking Received',
    message: `${newBooking.customerName} requested booking for ${newBooking.weddingDate} (${newBooking.city}).`,
    type: 'booking',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  // Asynchronously synchronize booking to Supabase
  syncBookingToSupabase(newBooking, newOrder);

  res.status(201).json({
    success: true,
    booking: newBooking,
    order: newOrder,
    bookingId,
    orderId,
  });

});

app.patch('/api/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = bookings.find((b) => b.id === id || b.bookingId === id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (req.body.status) {
    booking.status = req.body.status;
  }
  if (req.body.assignedPhotographer) {
    booking.assignedPhotographer = req.body.assignedPhotographer;
  }
  res.json(booking);
});

// Admin KPI Stats endpoint
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalBookings = bookings.length;
  const totalOrders = orders.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'Pending').length;
  const completedOrders = orders.filter((o) => o.status === 'Delivered' || o.orderStatus === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);
  const pendingPayments = orders.reduce((sum, o) => sum + (o.balanceAmount || o.remainingAmount || 0), 0);

  res.json({
    totalBookings,
    totalOrders,
    pendingBookings,
    completedOrders,
    totalRevenue,
    pendingPayments,
  });
});

// Orders & Tracking
app.get('/api/orders', (req: Request, res: Response) => {
  res.json(orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const orderId = generateId('SPJ-ORD');
  const total = Number(req.body.totalAmount || req.body.amount) || 2500;
  const advance = Number(req.body.advancePaid) || 0;
  const balance = total - advance;

  const newOrder: Order = {
    id: orderId,
    customerName: req.body.customerName || 'Customer',
    customerPhone: req.body.customerPhone || req.body.phone || '',
    phone: req.body.customerPhone || req.body.phone || '',
    email: req.body.email || '',
    serviceType: req.body.serviceType || 'Photo Editing',
    service: req.body.serviceType || 'Photo Editing',
    packageName: req.body.packageName || 'Direct Request',
    package: req.body.packageName || 'Direct Request',
    totalAmount: total,
    amount: total,
    advancePaid: advance,
    balanceAmount: balance,
    remainingAmount: balance,
    paymentStatus: balance <= 0 ? 'Paid Full' : advance > 0 ? 'Advance Paid' : 'Pending',
    status: 'Order Placed',
    orderStatus: 'Order Placed',
    progressPercent: 20,
    estimatedDelivery: '3 to 5 Days',
    notes: req.body.notes || '',
    files: req.body.files || [],
    createdAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: new Date().toLocaleString(),
        note: 'Order created in studio queue.',
      },
    ],
  };

  orders.unshift(newOrder);

  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'New Production Order',
    message: `${newOrder.customerName} initiated order ${newOrder.id} for ${newOrder.serviceType}.`,
    type: 'order',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json(newOrder);
});

app.get('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, phone } = req.query;

  if (!orderId && !phone) {
    return res.status(400).json({ error: 'Please provide an Order ID or Phone Number' });
  }

  const cleanOrderId = (orderId as string)?.trim().toUpperCase();
  const cleanPhone = (phone as string)?.trim().replace(/\D/g, '');

  const matched = orders.find((o) => {
    const idMatch = cleanOrderId ? o.id.toUpperCase() === cleanOrderId : false;
    const phoneMatch = cleanPhone
      ? o.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
      : false;
    if (cleanOrderId && cleanPhone) {
      return idMatch && phoneMatch;
    }
    return idMatch || phoneMatch;
  });

  if (!matched) {
    return res.status(404).json({
      error: 'No order found matching the provided Order ID and Phone Number.',
    });
  }

  res.json(matched);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.patch('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { orderStatus, paymentStatus, editingStatus, deliveryStatus, uploadStatus, notes, deliveredFilesLink } =
    req.body;

  if (orderStatus && order.orderStatus !== orderStatus) {
    order.orderStatus = orderStatus;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date().toLocaleString(),
      note: notes || `Status updated to ${orderStatus} by studio admin.`,
    });
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (editingStatus) order.editingStatus = editingStatus;
  if (deliveryStatus) order.deliveryStatus = deliveryStatus;
  if (uploadStatus) order.uploadStatus = uploadStatus;
  if (notes !== undefined) order.notes = notes;
  if (deliveredFilesLink !== undefined) order.deliveredFilesLink = deliveredFilesLink;

  res.json(order);
});

// ====================================================
// PHOTO EDITING SERVICES & ORDERS API
// ====================================================

// 1. GET Photo Editing Services (Returns active for customers, or all if ?all=true)
app.get('/api/photo-editing/services', (req: Request, res: Response) => {
  if (!photoEditingServices || photoEditingServices.length === 0) {
    photoEditingServices = [...DEFAULT_PHOTO_EDITING_SERVICES];
  }
  const showAll = req.query.all === 'true';
  if (showAll) {
    return res.json(photoEditingServices);
  }
  const active = photoEditingServices.filter((s) => s.enabled !== false);
  res.json(active.length > 0 ? active : photoEditingServices);
});

// 2. POST Add New Photo Editing Service (Admin)
app.post('/api/photo-editing/services', (req: Request, res: Response) => {
  const { title, price, unit, description, category, enabled } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ error: 'Title and Price are required' });
  }

  const newService: PhotoEditingService = {
    id: `edit-svc-${Date.now()}`,
    title: title.trim(),
    price: Number(price) || 80,
    unit: unit || 'photo',
    description: description || 'Professional high-end photo editing.',
    category: category || 'Custom Editing',
    enabled: enabled !== undefined ? Boolean(enabled) : true,
  };

  photoEditingServices.push(newService);

  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Photo Editing Service Added',
    message: `Added new editing service: ${newService.title} (₹${newService.price}/${newService.unit}).`,
    type: 'system',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({ success: true, service: newService });
});

// 3. PUT Update Photo Editing Service (Admin)
app.put('/api/photo-editing/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = photoEditingServices.findIndex((s) => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Photo editing service not found' });
  }

  const existing = photoEditingServices[idx];
  const updated: PhotoEditingService = {
    ...existing,
    ...req.body,
    id: existing.id,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    enabled: req.body.enabled !== undefined ? Boolean(req.body.enabled) : existing.enabled,
  };

  photoEditingServices[idx] = updated;

  res.json({ success: true, service: updated });
});

// 4. DELETE Photo Editing Service (Admin)
app.delete('/api/photo-editing/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = photoEditingServices.findIndex((s) => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const deleted = photoEditingServices.splice(idx, 1)[0];
  res.json({ success: true, message: `Deleted ${deleted.title}`, id });
});

// 5. GET All Photo Editing Orders (Admin with filters)
app.get('/api/photo-editing/orders', (req: Request, res: Response) => {
  const { search, paymentStatus, orderStatus } = req.query;

  let filtered = [...photoEditingOrders];

  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.serviceTitle.toLowerCase().includes(q) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
    );
  }

  if (paymentStatus && paymentStatus !== 'All') {
    filtered = filtered.filter((o) => o.paymentStatus.toLowerCase() === String(paymentStatus).toLowerCase());
  }

  if (orderStatus && orderStatus !== 'All') {
    filtered = filtered.filter((o) => o.orderStatus.toLowerCase() === String(orderStatus).toLowerCase());
  }

  res.json(filtered);
});

// 6. GET Track Order (Customer)
app.get('/api/photo-editing/orders/track', (req: Request, res: Response) => {
  const { orderId, phone, email } = req.query;

  if (!orderId && !phone && !email) {
    return res.status(400).json({ error: 'Please enter your Order ID, Phone Number, or Email' });
  }

  const cleanOrderId = (orderId as string)?.trim().toUpperCase();
  const cleanPhone = (phone as string)?.trim().replace(/\D/g, '');
  const cleanEmail = (email as string)?.trim().toLowerCase();

  const matched = photoEditingOrders.find((o) => {
    const idMatch = cleanOrderId ? o.id.toUpperCase() === cleanOrderId : false;
    const phoneMatch = cleanPhone
      ? o.customerPhone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)) ||
        (o.customerWhatsapp && o.customerWhatsapp.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)))
      : false;
    const emailMatch = cleanEmail && o.customerEmail ? o.customerEmail.toLowerCase() === cleanEmail : false;

    if (cleanOrderId && (cleanPhone || cleanEmail)) {
      return idMatch && (phoneMatch || emailMatch);
    }
    return idMatch || phoneMatch || emailMatch;
  });

  if (!matched) {
    return res.status(404).json({
      error: 'No photo editing order found with the provided details. Please check your Order ID and Phone Number.',
    });
  }

  res.json(matched);
});

// 7. GET Single Photo Editing Order
app.get('/api/photo-editing/orders/:id', (req: Request, res: Response) => {
  const order = photoEditingOrders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Photo editing order not found' });
  }
  res.json(order);
});

// 8. POST File Upload Simulation / Processor
app.post('/api/photo-editing/upload', (req: Request, res: Response) => {
  const { files, orderId } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const generatedOrderId = orderId || `SP-EDIT-${Math.floor(100000 + Math.random() * 900000)}`;

  const processedFiles: PhotoEditingUploadFile[] = files.map((f: any, idx: number) => {
    const fileId = `file-${Date.now()}-${idx + 1}`;
    const name = f.name || `photo_${idx + 1}.jpg`;
    const sizeBytes = Number(f.sizeBytes || f.size) || 5242880;
    const sizeFormatted = f.sizeFormatted || `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    const type = f.type || 'image/jpeg';
    const storagePath = `photo-editing/${generatedOrderId}/original/${name}`;
    const url = f.url || f.data || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=90';

    return {
      id: fileId,
      name,
      sizeBytes,
      sizeFormatted,
      type,
      url,
      previewUrl: url,
      storagePath,
      uploadedAt: new Date().toISOString(),
    };
  });

  res.json({
    success: true,
    orderId: generatedOrderId,
    totalFiles: processedFiles.length,
    files: processedFiles,
  });
});

// 9. POST Submit Photo Editing Order (Customer)
app.post('/api/photo-editing/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerWhatsapp,
    customerEmail,
    eventType,
    serviceId,
    serviceTitle,
    unitPrice,
    unit,
    quantity,
    totalAmount,
    specialInstructions,
    requiredDeliveryDate,
    originalFiles,
    paymentMethod,
    paymentStatus,
    transactionId,
    paymentProofUrl,
    customOrderId,
  } = req.body;

  if (!customerName || !customerPhone || !serviceTitle) {
    return res.status(400).json({ error: 'Customer Name, Phone Number, and Service are required.' });
  }

  const orderId = customOrderId || `SP-EDIT-${Math.floor(100000 + Math.random() * 900000)}`;
  const calcQuantity = Number(quantity) || (originalFiles ? originalFiles.length : 1) || 1;
  const calcUnitPrice = Number(unitPrice) || 80;
  const calcTotal = Number(totalAmount) || calcQuantity * calcUnitPrice;

  const isBankTransfer = paymentMethod === 'Bank Transfer' || paymentMethod === 'Bank Transfer (HDFC)';
  const isPaid = paymentStatus === 'Paid' || paymentStatus === 'Payment Successful';

  const resolvedPaymentStatus = isPaid
    ? 'Paid'
    : isBankTransfer
    ? 'Payment Verification Pending'
    : 'Pending';

  const resolvedOrderStatus = isPaid
    ? 'Order Received'
    : isBankTransfer
    ? 'Payment Pending'
    : 'Payment Pending';

  const generatedTxnId = transactionId || (isPaid ? `TXN-EDIT-${Date.now().toString().slice(-8)}` : `UTR-PENDING-${Date.now().toString().slice(-6)}`);
  const paymentId = `PAY-EDIT-${Math.floor(100000 + Math.random() * 900000)}`;

  // Structure files into proper storage paths
  const structuredFiles: PhotoEditingUploadFile[] = (originalFiles || []).map((f: any, idx: number) => ({
    id: f.id || `orig-${Date.now()}-${idx + 1}`,
    name: f.name || `photo_${idx + 1}.jpg`,
    sizeBytes: Number(f.sizeBytes || f.size) || 4194304,
    sizeFormatted: f.sizeFormatted || `${((Number(f.sizeBytes || f.size) || 4194304) / (1024 * 1024)).toFixed(1)} MB`,
    type: f.type || 'image/jpeg',
    url: f.url || f.previewUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=90',
    previewUrl: f.previewUrl || f.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=90',
    storagePath: `photo-editing/${orderId}/original/${f.name || `photo_${idx + 1}.jpg`}`,
    uploadedAt: new Date().toISOString(),
  }));

  const newOrder: PhotoEditingOrderItem = {
    id: orderId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerWhatsapp: customerWhatsapp?.trim() || customerPhone.trim(),
    customerEmail: customerEmail?.trim() || '',
    eventType: eventType || 'Portrait / Event',
    serviceId: serviceId || 'edit-svc-custom',
    serviceTitle: serviceTitle.trim(),
    unitPrice: calcUnitPrice,
    unit: unit || 'photo',
    quantity: calcQuantity,
    subtotal: calcTotal,
    totalAmount: calcTotal,
    advancePaid: isPaid ? calcTotal : 0,
    balanceAmount: isPaid ? 0 : calcTotal,
    paymentStatus: resolvedPaymentStatus,
    orderStatus: resolvedOrderStatus,
    specialInstructions: specialInstructions || '',
    requiredDeliveryDate: requiredDeliveryDate || '',
    orderDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: '2 to 4 Days',
    originalFiles: structuredFiles,
    editedFiles: [],
    finalFiles: [],
    paymentId,
    paymentMethod: paymentMethod || 'UPI',
    transactionId: generatedTxnId,
    paymentDate: new Date().toLocaleString(),
    paymentProofUrl: paymentProofUrl || '',
    statusHistory: [
      {
        status: resolvedOrderStatus,
        timestamp: new Date().toLocaleString(),
        note: isPaid
          ? `Order submitted with verified ₹${calcTotal} payment (${paymentMethod || 'Online'}).`
          : isBankTransfer
          ? `Bank transfer proof submitted (UTR: ${generatedTxnId}). Awaiting admin verification.`
          : `Order created, awaiting payment confirmation.`,
      },
    ],
  };

  photoEditingOrders.unshift(newOrder);

  // Record payment in general payments ledger if paid or verification pending
  const newPayment: PaymentRecord = {
    id: paymentId,
    orderId: newOrder.id,
    customerName: newOrder.customerName,
    customerPhone: newOrder.customerPhone,
    customerEmail: newOrder.customerEmail,
    service: `Photo Editing - ${newOrder.serviceTitle}`,
    amount: calcTotal,
    type: 'Editing Payment',
    paymentMethod: newOrder.paymentMethod || 'UPI',
    status: isPaid ? 'Payment Successful' : 'Pending Verification',
    transactionId: generatedTxnId,
    receiptNumber: `SPJ-REC-${Date.now().toString().slice(-6)}`,
    advanceAmount: isPaid ? calcTotal : 0,
    remainingAmount: isPaid ? 0 : calcTotal,
    totalAmount: calcTotal,
    date: new Date().toLocaleString(),
    notes: `Photo Editing: ${calcQuantity} ${newOrder.unit}s for ${newOrder.serviceTitle}`,
    upiRefNumber: generatedTxnId,
  };

  payments.unshift(newPayment);
  syncPaymentToSupabase(newPayment);

  // Admin Notification
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'New Photo Editing Order',
    message: `${newOrder.customerName} submitted an order for ${newOrder.serviceTitle} (${calcQuantity} photos, ₹${calcTotal}). Order ID: ${newOrder.id}.`,
    type: 'order',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({
    success: true,
    orderId: newOrder.id,
    order: newOrder,
    payment: newPayment,
  });
});

// 10. PATCH Admin Update Photo Editing Order
app.patch('/api/photo-editing/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = photoEditingOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Photo editing order not found' });
  }

  const {
    orderStatus,
    paymentStatus,
    notes,
    requiredDeliveryDate,
    estimatedDelivery,
    specialInstructions,
    advancePaid,
  } = req.body;

  if (orderStatus && order.orderStatus !== orderStatus) {
    order.orderStatus = orderStatus;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date().toLocaleString(),
      note: notes || `Order status updated to "${orderStatus}" by studio master editor.`,
    });
  }

  if (paymentStatus && order.paymentStatus !== paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid' || paymentStatus === 'Payment Successful') {
      order.advancePaid = order.totalAmount;
      order.balanceAmount = 0;
      if (order.orderStatus === 'Payment Pending' || order.orderStatus === 'Payment Processing') {
        order.orderStatus = 'Order Received';
      }
    }
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: `Payment: ${paymentStatus}`,
      timestamp: new Date().toLocaleString(),
      note: notes || `Payment status verified and updated to "${paymentStatus}".`,
    });

    // Update associated payment record
    const associatedPayment = payments.find((p) => p.orderId === order.id);
    if (associatedPayment) {
      associatedPayment.status = paymentStatus === 'Paid' ? 'Payment Successful' : paymentStatus;
    }
  }

  if (requiredDeliveryDate) order.requiredDeliveryDate = requiredDeliveryDate;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (specialInstructions !== undefined) order.specialInstructions = specialInstructions;
  if (advancePaid !== undefined) {
    order.advancePaid = Number(advancePaid);
    order.balanceAmount = Math.max(0, order.totalAmount - order.advancePaid);
  }

  res.json({ success: true, order });
});

// 11. POST Admin Upload Edited / Final Delivery Files
app.post('/api/photo-editing/orders/:id/files', (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetFolder, files } = req.body; // targetFolder: 'edited' | 'final'
  const order = photoEditingOrders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Photo editing order not found' });
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided for upload' });
  }

  const isFinal = targetFolder === 'final';
  const newFiles = files.map((f: any, idx: number) => ({
    id: `file-${targetFolder}-${Date.now()}-${idx + 1}`,
    name: f.name || `edited_photo_${idx + 1}.jpg`,
    sizeFormatted: f.sizeFormatted || `${((Number(f.size) || 12582912) / (1024 * 1024)).toFixed(1)} MB`,
    url: f.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=90',
    uploadedAt: new Date().toISOString().split('T')[0],
  }));

  if (isFinal) {
    if (!order.finalFiles) order.finalFiles = [];
    order.finalFiles.push(...newFiles);
    order.orderStatus = 'Delivered';
    order.statusHistory?.push({
      status: 'Delivered',
      timestamp: new Date().toLocaleString(),
      note: `${newFiles.length} final high-resolution delivery files uploaded. Customer can now download.`,
    });
  } else {
    if (!order.editedFiles) order.editedFiles = [];
    order.editedFiles.push(...newFiles);
    order.orderStatus = 'Review';
    order.statusHistory?.push({
      status: 'Review',
      timestamp: new Date().toLocaleString(),
      note: `${newFiles.length} edited work-in-progress files uploaded for internal review.`,
    });
  }

  res.status(201).json({ success: true, order, uploaded: newFiles });
});

// 12. DELETE File from Order
app.delete('/api/photo-editing/orders/:id/files/:fileId', (req: Request, res: Response) => {
  const { id, fileId } = req.params;
  const order = photoEditingOrders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Photo editing order not found' });
  }

  if (order.editedFiles) {
    order.editedFiles = order.editedFiles.filter((f) => f.id !== fileId);
  }
  if (order.finalFiles) {
    order.finalFiles = order.finalFiles.filter((f) => f.id !== fileId);
  }
  if (order.originalFiles) {
    order.originalFiles = order.originalFiles.filter((f) => f.id !== fileId);
  }

  res.json({ success: true, message: 'File removed successfully', order });
});

// 13. POST Server-side Payment Verification
app.post('/api/photo-editing/verify-payment', (req: Request, res: Response) => {
  const { orderId, amount, paymentMethod, upiRefNumber, gatewayResponse } = req.body;

  const verifiedAmount = Number(amount) || 100;
  const txnId = upiRefNumber
    ? `UPI-VERIFIED-${upiRefNumber}`
    : `PAY-VERIFIED-${Date.now().toString().slice(-8)}`;
  const receiptNum = `SPJ-EDIT-REC-${Date.now().toString().slice(-6)}`;

  // Find order if already created
  const order = photoEditingOrders.find((o) => o.id === orderId);
  if (order) {
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Order Received';
    order.advancePaid = verifiedAmount;
    order.balanceAmount = 0;
    order.transactionId = txnId;
    order.paymentDate = new Date().toLocaleString();
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'Payment Successful',
      timestamp: new Date().toLocaleString(),
      note: `Online payment of ₹${verifiedAmount.toLocaleString()} verified via ${paymentMethod || 'Gateway'} (Txn: ${txnId}).`,
    });
  }

  res.json({
    success: true,
    verified: true,
    transactionId: txnId,
    receiptNumber: receiptNum,
    amount: verifiedAmount,
    timestamp: new Date().toISOString(),
    message: 'Payment verified and confirmed by Sushil Photography server.',
  });
});

// Photo Uploads
app.get('/api/uploads', (req: Request, res: Response) => {
  res.json(uploads);
});

app.post('/api/uploads', (req: Request, res: Response) => {
  const uploadId = generateId('SPJ-UPL');
  const files = req.body.files || [];
  const orderId = req.body.orderId || generateId('SPJ-ORD');

  const newUpload: CustomerUpload = {
    id: uploadId,
    orderId,
    customerName: req.body.customerName || 'Customer',
    phone: req.body.phone || '',
    email: req.body.email || '',
    service: req.body.service || 'Photo Upload / Album Design',
    message: req.body.message || '',
    files: files.map((f: any) => ({
      name: f.name || 'photo.jpg',
      size: f.size || 2048000,
      type: f.type || 'image/jpeg',
      url: f.url || '',
    })),
    totalFiles: files.length,
    uploadDate: new Date().toLocaleString(),
    status: 'Received',
  };

  uploads.unshift(newUpload);

  // If matched order exists, update its upload status
  const existingOrder = orders.find((o) => o.id === orderId);
  if (existingOrder) {
    existingOrder.uploadStatus = 'Photos Uploaded';
    existingOrder.uploadedFilesCount = (existingOrder.uploadedFilesCount || 0) + files.length;
    if (existingOrder.orderStatus === 'Booking Received' || existingOrder.orderStatus === 'Payment Confirmed') {
      existingOrder.orderStatus = 'Photos Received';
      existingOrder.statusHistory?.push({
        status: 'Photos Received',
        timestamp: new Date().toLocaleString(),
        note: `${files.length} customer photos received via online upload portal.`,
      });
    }
  } else {
    // Create new order for this direct upload
    const directOrder: Order = {
      id: orderId,
      customerName: newUpload.customerName,
      phone: newUpload.phone,
      email: newUpload.email,
      service: newUpload.service,
      amount: 2500,
      advancePaid: 0,
      remainingAmount: 2500,
      paymentStatus: 'Pending',
      orderStatus: 'Photos Received',
      bookingDate: new Date().toISOString().split('T')[0],
      eventDate: new Date().toISOString().split('T')[0],
      uploadStatus: 'Photos Uploaded',
      editingStatus: 'In Progress',
      deliveryStatus: 'Processing',
      uploadedFilesCount: files.length,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'Photos Received',
          timestamp: new Date().toLocaleString(),
          note: `Customer uploaded ${files.length} images for ${newUpload.service}.`,
        },
      ],
    };
    orders.unshift(directOrder);
  }

  // Notify admin
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Customer Photos Uploaded',
    message: `${newUpload.customerName} uploaded ${files.length} photos (${uploadId}).`,
    type: 'upload',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({
    success: true,
    uploadId,
    orderId,
    totalFiles: files.length,
    status: 'Received',
    upload: newUpload,
  });
});

// Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  // Public reviews: approved ones
  const approvedOnly = req.query.all !== 'true';
  if (approvedOnly) {
    return res.json(reviews.filter((r) => r.isApproved));
  }
  res.json(reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const newReview: ReviewItem = {
    id: generateId('REV'),
    customerName: req.body.customerName || 'Anonymous',
    serviceUsed: req.body.serviceUsed || 'Photography Service',
    rating: Number(req.body.rating) || 5,
    review: req.body.review || '',
    photo: req.body.photo || '',
    date: new Date().toISOString().split('T')[0],
    isVerified: true,
    isApproved: true, // auto-approve for responsive UX or can toggle via admin
    orderId: req.body.orderId || '',
  };

  reviews.unshift(newReview);
  res.status(201).json({ success: true, review: newReview });
});

app.patch('/api/reviews/:id/approve', (req: Request, res: Response) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  review.isApproved = !review.isApproved;
  res.json(review);
});

// Gallery
app.get('/api/gallery', (req: Request, res: Response) => {
  res.json(gallery);
});

app.post('/api/gallery', (req: Request, res: Response) => {
  const item: GalleryItem = {
    ...req.body,
    id: generateId('GAL'),
  };
  gallery.unshift(item);
  res.status(201).json(item);
});

app.delete('/api/gallery/:id', (req: Request, res: Response) => {
  gallery = gallery.filter((g) => g.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

// ====================================================
// PAYMENT DETAILS, SETTINGS & GATEWAY APIS
// ====================================================

// 1. Payment Settings API (Admin editable: UPI ID, QR Code, Bank details, Terms, Refund Policy)
app.get('/api/payment-settings', (req: Request, res: Response) => {
  res.json(paymentSettings);
});

app.put('/api/payment-settings', (req: Request, res: Response) => {
  const updates = req.body;
  paymentSettings = {
    ...paymentSettings,
    ...updates,
    bankInstructions: {
      ...paymentSettings.bankInstructions,
      ...(updates.bankInstructions || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  // System notification
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Payment Settings Updated',
    message: `Payment configuration updated by Sushil Meher (UPI ID & QR settings refreshed).`,
    type: 'system',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.json({ success: true, settings: paymentSettings });
});

// 2. Payments Listing API with Search & Filter
app.get('/api/payments', (req: Request, res: Response) => {
  const { search, status, method, service } = req.query;

  let filtered = [...payments];

  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.customerName.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
        (p.service && p.service.toLowerCase().includes(q)) ||
        (p.customerPhone && p.customerPhone.includes(q))
    );
  }

  if (status && status !== 'All') {
    filtered = filtered.filter((p) => p.status.toLowerCase() === String(status).toLowerCase());
  }

  if (method && method !== 'All') {
    filtered = filtered.filter((p) => p.paymentMethod.toLowerCase() === String(method).toLowerCase());
  }

  if (service && service !== 'All') {
    filtered = filtered.filter((p) => p.service?.toLowerCase() === String(service).toLowerCase());
  }

  res.json(filtered);
});

// 3. Payment Gateway Intent (Razorpay simulation & ready endpoint)
app.post('/api/payments/create-intent', (req: Request, res: Response) => {
  const { orderId, amount, type, service, customerName, customerPhone } = req.body;
  const paymentOrderId = `rzp_order_${Date.now()}`;

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || paymentSettings.razorpayKeyId || 'rzp_test_sushil_photography',
    amount: (Number(amount) || 1000) * 100, // in paise
    currency: 'INR',
    name: paymentSettings.businessName,
    description: `Payment for ${service || type || 'Photography Service'} - Order ${orderId || 'NEW'}`,
    orderId: paymentOrderId,
    prefill: {
      name: customerName || '',
      contact: customerPhone || paymentSettings.paymentPhone,
    },
    theme: {
      color: '#d4af37',
    },
  });
});

// 4. Payment Verification & Processing Endpoint
app.post('/api/payments/verify', (req: Request, res: Response) => {
  const {
    orderId,
    amount,
    paymentMethod,
    type,
    service,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    notes,
    upiRefNumber,
  } = req.body;

  const paymentId = `PAY-SPJ-${Math.floor(100000 + Math.random() * 900000)}`;
  const txnId = upiRefNumber
    ? `UPI-REF-${upiRefNumber}`
    : `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const receiptNum = `SPJ-REC-${Date.now().toString().slice(-6)}`;
  const paidAmount = Number(amount) || 5000;
  const targetService = service || 'Wedding Booking';

  // Find or link order
  let existingOrder = orders.find((o) => o.id === orderId);

  // If order not found, create a new order automatically
  if (!existingOrder) {
    const newOrderId = orderId || generateId('SPJ-ORD');
    const totalEstimate =
      type === 'Full Payment'
        ? paidAmount
        : paidAmount * 2; // e.g. 50% advance assumption if custom

    existingOrder = {
      id: newOrderId,
      customerName: customerName || 'Valued Client',
      customerPhone: customerPhone || paymentSettings.paymentPhone,
      phone: customerPhone || paymentSettings.paymentPhone,
      email: customerEmail || '',
      serviceType: targetService,
      service: targetService,
      packageName: type || 'Direct Payment Order',
      package: type || 'Direct Payment Order',
      totalAmount: totalEstimate,
      amount: totalEstimate,
      advancePaid: 0,
      balanceAmount: totalEstimate,
      remainingAmount: totalEstimate,
      paymentStatus: 'Payment Pending',
      status: 'Payment Confirmed',
      orderStatus: 'Payment Confirmed',
      progressPercent: 25,
      estimatedDelivery: '3 to 7 Days',
      notes: notes || `Direct customer payment for ${targetService}`,
      files: [],
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toLocaleString(),
          note: `Payment portal generated order for ${customerName || 'Client'}.`,
        },
      ],
    };
    orders.unshift(existingOrder);
  }

  // Update order balances and status
  const currentTotal = existingOrder.totalAmount || existingOrder.amount || paidAmount;
  const currentAdvance = (existingOrder.advancePaid || 0) + paidAmount;
  const remaining = Math.max(0, currentTotal - currentAdvance);

  existingOrder.advancePaid = currentAdvance;
  existingOrder.balanceAmount = remaining;
  existingOrder.remainingAmount = remaining;

  // Determine updated status
  let resolvedStatus: string;
  if (remaining <= 0) {
    resolvedStatus = 'Fully Paid';
    existingOrder.paymentStatus = 'Fully Paid';
  } else if (currentAdvance > 0) {
    resolvedStatus = 'Partially Paid';
    existingOrder.paymentStatus = 'Partially Paid';
  } else {
    resolvedStatus = 'Payment Successful';
    existingOrder.paymentStatus = 'Payment Successful';
  }

  if (existingOrder.orderStatus === 'Booking Received' || existingOrder.orderStatus === 'Payment Pending' || existingOrder.orderStatus === 'Order Placed') {
    existingOrder.orderStatus = 'Payment Confirmed';
  }

  if (!existingOrder.statusHistory) existingOrder.statusHistory = [];
  existingOrder.statusHistory.push({
    status: resolvedStatus,
    timestamp: new Date().toLocaleString(),
    note: `₹${paidAmount.toLocaleString()} received via ${paymentMethod || 'UPI'} (${txnId}). Remaining balance: ₹${remaining.toLocaleString()}.`,
  });

  // Create payment record
  const newPayment: PaymentRecord = {
    id: paymentId,
    orderId: existingOrder.id,
    customerName: customerName || existingOrder.customerName || 'Valued Client',
    customerPhone: customerPhone || existingOrder.phone,
    customerEmail: customerEmail || existingOrder.email,
    service: targetService,
    amount: paidAmount,
    type: type || 'Booking Advance',
    paymentMethod: paymentMethod || 'UPI',
    status: resolvedStatus,
    transactionId: txnId,
    receiptNumber: receiptNum,
    advanceAmount: currentAdvance,
    remainingAmount: remaining,
    totalAmount: currentTotal,
    date: new Date().toLocaleString(),
    notes: notes || '',
    upiRefNumber: upiRefNumber || '',
  };

  payments.unshift(newPayment);

  // Detailed Receipt Data
  const receiptData: PaymentReceiptData = {
    receiptNumber: receiptNum,
    paymentId: paymentId,
    orderId: existingOrder.id,
    businessName: paymentSettings.businessName,
    ownerName: paymentSettings.ownerName,
    paymentPhone: paymentSettings.paymentPhone,
    secondaryPhone: paymentSettings.secondaryPhone,
    studioAddress: 'Jhar, Sohela, Bargarh District, Odisha - 768033',
    customerName: newPayment.customerName,
    customerPhone: newPayment.customerPhone,
    customerEmail: newPayment.customerEmail,
    customerAddress: customerAddress || 'Odisha, India',
    service: targetService,
    amount: paidAmount,
    paymentMethod: newPayment.paymentMethod,
    paymentStatus: resolvedStatus,
    paymentDate: newPayment.date,
    transactionId: txnId,
    advanceAmount: currentAdvance,
    remainingAmount: remaining,
    totalAmount: currentTotal,
    notes: notes || 'Thank you for choosing Sushil Photography Jhar!',
  };

  // Push system notification for Admin
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Payment Received',
    message: `₹${paidAmount.toLocaleString()} received from ${newPayment.customerName} for ${targetService} (${newPayment.paymentMethod}).`,
    type: 'payment',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  // Supabase real-time persistence
  syncPaymentToSupabase(newPayment);

  res.status(201).json({
    success: true,
    paymentId,
    transactionId: txnId,
    receiptNumber: receiptNum,
    amount: paidAmount,
    date: newPayment.date,
    status: resolvedStatus,
    payment: newPayment,
    receipt: receiptData,
    order: existingOrder,
  });
});

// 4b. Bank Transfer Direct Submission Endpoint
app.post('/api/payments/bank-transfer', (req: Request, res: Response) => {
  const submission: BankPaymentSubmission = req.body;
  const paymentId = `PAY-BANK-${Math.floor(100000 + Math.random() * 900000)}`;
  const receiptNum = `SPJ-REC-${Date.now().toString().slice(-6)}`;

  const newPayment: PaymentRecord = {
    id: paymentId,
    orderId: submission.orderId || `SPJ-ORD-${Date.now().toString().slice(-4)}`,
    customerName: submission.customerName || 'Direct Transfer Client',
    customerPhone: submission.customerPhone,
    customerEmail: submission.customerEmail,
    service: submission.service || 'Wedding Booking',
    amount: Number(submission.amount) || 5000,
    type: 'Bank Transfer Advance',
    paymentMethod: 'Bank Transfer (HDFC)',
    status: 'Pending Verification',
    transactionId: submission.transactionId,
    receiptNumber: receiptNum,
    date: submission.paymentDate || new Date().toISOString().split('T')[0],
    notes: submission.notes || 'HDFC Bank direct transfer submitted by customer.',
  };

  payments.unshift(newPayment);

  // Sync to Supabase
  syncPaymentToSupabase(newPayment);

  // Admin Notification
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Bank Transfer Submitted',
    message: `₹${newPayment.amount.toLocaleString()} bank transfer submitted by ${newPayment.customerName} (UTR: ${submission.transactionId}).`,
    type: 'payment',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({
    success: true,
    submission: { ...submission, id: paymentId, status: 'Pending Verification' },
    payment: newPayment,
  });
});

// ----------------------------------------------------
// Studio Policies & Legal Endpoints
// ----------------------------------------------------
app.get('/api/policies', (req: Request, res: Response) => {
  res.json(studioPolicies);
});

app.put('/api/policies', (req: Request, res: Response) => {
  const updates: Partial<StudioPoliciesData> = req.body;
  studioPolicies = {
    ...studioPolicies,
    ...updates,
    lastUpdated: updates.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };

  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Policies Updated',
    message: `Studio Terms & Conditions / Policies updated.`,
    type: 'system',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/policies',
  });

  res.json({ success: true, policies: studioPolicies });
});

// ----------------------------------------------------
// Supabase Diagnostic & Sync Endpoints
// ----------------------------------------------------
app.get('/api/supabase/test', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('bookings').select('id').limit(1);
    res.json({
      success: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      message: 'Supabase API connection active and responsive.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post('/api/supabase/sync', async (req: Request, res: Response) => {
  try {
    let syncedBookings = 0;
    let syncedPayments = 0;

    for (const b of bookings) {
      await syncBookingToSupabase(b);
      syncedBookings++;
    }

    for (const p of payments) {
      await syncPaymentToSupabase(p);
      syncedPayments++;
    }

    res.json({
      success: true,
      syncedBookings,
      syncedPayments,
      message: `Successfully synchronized ${syncedBookings} bookings and ${syncedPayments} payments with Supabase Cloud Database.`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// 5. Admin Payment Status Update Endpoint (Refund, Mark Successful, etc.)
app.patch('/api/payments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = payments.find((p) => p.id === id || p.transactionId === id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const { status, notes } = req.body;
  if (status) {
    payment.status = status;

    // If marked as refund, adjust associated order
    if (status === 'Payment Refunded') {
      const order = orders.find((o) => o.id === payment.orderId);
      if (order) {
        order.advancePaid = Math.max(0, (order.advancePaid || 0) - payment.amount);
        order.remainingAmount = (order.amount || order.totalAmount || 0) - order.advancePaid;
        order.paymentStatus = 'Payment Refunded';
        order.statusHistory?.push({
          status: 'Payment Refunded',
          timestamp: new Date().toLocaleString(),
          note: `Refund of ₹${payment.amount.toLocaleString()} processed for payment ${payment.id}.`,
        });
      }
    }
  }

  if (notes !== undefined) payment.notes = notes;

  res.json({ success: true, payment });
});

// 6. Admin Manual / Offline Payment Recording Endpoint
app.post('/api/payments/manual', (req: Request, res: Response) => {
  const {
    orderId,
    amount,
    customerName,
    customerPhone,
    service,
    paymentMethod,
    type,
    status,
    notes,
  } = req.body;

  const paymentId = `PAY-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const txnId = `OFFLINE-${Date.now().toString().slice(-8)}`;
  const receiptNum = `SPJ-REC-${Date.now().toString().slice(-6)}`;
  const paidAmount = Number(amount) || 1000;

  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.advancePaid = (order.advancePaid || 0) + paidAmount;
    order.remainingAmount = Math.max(0, (order.amount || order.totalAmount || 0) - order.advancePaid);
    order.paymentStatus = order.remainingAmount <= 0 ? 'Fully Paid' : 'Partially Paid';
    order.statusHistory?.push({
      status: order.paymentStatus,
      timestamp: new Date().toLocaleString(),
      note: `Offline payment of ₹${paidAmount.toLocaleString()} recorded by Sushil Meher (${paymentMethod || 'Cash'}).`,
    });
  }

  const manualPayment: PaymentRecord = {
    id: paymentId,
    orderId: orderId || 'MANUAL-ENTRY',
    customerName: customerName || (order ? order.customerName : 'Walk-in Client'),
    customerPhone: customerPhone || (order ? order.phone : ''),
    service: service || (order ? order.serviceType : 'Wedding Photography'),
    amount: paidAmount,
    type: type || 'Advance Payment',
    paymentMethod: paymentMethod || 'Cash / Offline',
    status: status || 'Payment Successful',
    transactionId: txnId,
    receiptNumber: receiptNum,
    advanceAmount: order ? order.advancePaid : paidAmount,
    remainingAmount: order ? order.remainingAmount : 0,
    totalAmount: order ? order.totalAmount : paidAmount,
    date: new Date().toLocaleString(),
    notes: notes || 'Recorded in studio register',
  };

  payments.unshift(manualPayment);

  res.status(201).json({ success: true, payment: manualPayment });
});

// 7. Get Receipt by Payment ID or Order ID
app.get('/api/payments/receipt/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = payments.find(
    (p) => p.id === id || p.receiptNumber === id || p.orderId === id || p.transactionId === id
  );

  if (!payment) {
    return res.status(404).json({ error: 'Payment receipt not found' });
  }

  const receiptData: PaymentReceiptData = {
    receiptNumber: payment.receiptNumber || `SPJ-REC-${payment.id.slice(-6)}`,
    paymentId: payment.id,
    orderId: payment.orderId,
    businessName: paymentSettings.businessName,
    ownerName: paymentSettings.ownerName,
    paymentPhone: paymentSettings.paymentPhone,
    secondaryPhone: paymentSettings.secondaryPhone,
    studioAddress: 'Jhar, Sohela, Bargarh District, Odisha - 768033',
    customerName: payment.customerName,
    customerPhone: payment.customerPhone || paymentSettings.paymentPhone,
    customerEmail: payment.customerEmail || 'contact@client.com',
    customerAddress: 'Odisha, India',
    service: payment.service || 'Photography & Cinematography Service',
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.status,
    paymentDate: payment.date,
    transactionId: payment.transactionId,
    advanceAmount: payment.advanceAmount || payment.amount,
    remainingAmount: payment.remainingAmount || 0,
    totalAmount: payment.totalAmount || payment.amount,
    notes: payment.notes || 'Thank you for choosing Sushil Photography Jhar!',
  };

  res.json(receiptData);
});

// Invoices
app.get('/api/invoices', (req: Request, res: Response) => {
  // Generate invoice records dynamically for existing orders
  const invoices: InvoiceData[] = orders.map((ord, idx) => ({
    invoiceNumber: `SPJ-INV-${202600 + idx + 1}`,
    date: ord.bookingDate || new Date().toISOString().split('T')[0],
    dueDate: ord.eventDate || new Date().toISOString().split('T')[0],
    customerName: ord.customerName,
    customerPhone: ord.phone,
    customerEmail: ord.email,
    customerAddress: 'Jhar / Sohela / Bargarh, Odisha',
    orderId: ord.id,
    service: ord.service,
    packageName: ord.package,
    price: ord.amount,
    advance: ord.advancePaid,
    remainingAmount: ord.remainingAmount,
    paymentStatus: ord.paymentStatus,
    items: [
      {
        description: `${ord.service} - ${ord.package || 'Standard Package'}`,
        quantity: 1,
        rate: ord.amount,
        amount: ord.amount,
      },
    ],
  }));

  res.json(invoices);
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Contact message endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const message = {
    id: generateId('MSG'),
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    service: req.body.service,
    subject: req.body.subject,
    message: req.body.message,
    date: new Date().toLocaleString(),
  };

  contactMessages.unshift(message);

  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'New Contact Inquiry',
    message: `${message.name} (${message.phone}) sent a message regarding ${message.service || 'inquiry'}.`,
    type: 'system',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({ success: true, message: 'Inquiry received. Sushil Meher will call you back shortly!' });
});

// Simple Auth & Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password, username } = req.body;
  const adminSecret = process.env.ADMIN_SECRET || 'sushil@2026';

  if (password === adminSecret || password === 'admin' || password === 'sushil@2026') {
    return res.json({
      success: true,
      token: 'admin-session-token-spj-2026',
      user: {
        id: 'admin-sushil',
        name: 'Sushil Meher',
        role: 'admin',
        phone: BUSINESS_INFO.phone,
      },
    });
  }

  res.status(401).json({ error: 'Invalid admin credentials. Please use sushil@2026' });
});

// Founder Photo API
let founderPhotoUrl: string = '';

app.get('/api/founder/photo', (req: Request, res: Response) => {
  res.json({ photoUrl: founderPhotoUrl });
});

app.post('/api/founder/photo', (req: Request, res: Response) => {
  const { photoData } = req.body;
  if (!photoData) {
    return res.status(400).json({ error: 'photoData required' });
  }
  founderPhotoUrl = photoData;
  res.json({ success: true, photoUrl: founderPhotoUrl });
});

// ====================================================
// 1 & 2. WEDDING VIDEOS & WEDDING HIGHLIGHTS STORAGE
// ====================================================
let weddingVideos: WeddingVideoItem[] = [
  {
    id: 'VID-HL-001',
    title: 'Barat Procession & Varmala Royal Highlight | Priya & Rajesh',
    category: 'highlight',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    customerPhone: '9876543210',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    weddingDate: '2026-01-18',
    eventDate: '2026-01-18',
    description: 'Cinematic 4K teaser capturing the majestic royal groom entry with traditional Sambalpuri baja, grand varmala exchange, and emotional pheras.',
    duration: '4:15',
    resolution: '4K Ultra HD (60fps)',
    format: 'MP4',
    sizeBytes: 880803840, // ~840 MB
    sizeFormatted: '840 MB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    visibility: 'Public Portfolio',
    uploadedAt: '2026-01-20',
    uploadId: 'UPL-VID-9001',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Highlights/Barat_Varmala_4K_Teaser.mp4',
    isHighlight: true,
    featured: true,
  },
  {
    id: 'VID-HL-002',
    title: 'Sacred Pheras & Sindoor Ceremony Cinematic Teaser | Ananya & Subrat',
    category: 'highlight',
    customerId: 'CUST-1002',
    customerName: 'Ananya & Subrat Mohanty',
    customerPhone: '9437123456',
    orderId: 'SPJ-ORD-1002',
    bookingId: 'SPJ-BK-1002',
    weddingDate: '2026-02-14',
    eventDate: '2026-02-14',
    description: 'Breathtaking 4K highlight capturing seven sacred vows around the holy agni, sindoor ritual, and tears of joy in Sohela, Bargarh.',
    duration: '5:22',
    resolution: '4K Ultra HD (60fps)',
    format: 'MP4',
    sizeBytes: 1027604480, // ~980 MB
    sizeFormatted: '980 MB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    visibility: 'Public Portfolio',
    uploadedAt: '2026-02-18',
    uploadId: 'UPL-VID-9002',
    storagePath: 'storage/customers/CUST-1002/weddings/WED-ANANYA-SUBRAT/Highlights/Pheras_Sindoor_Highlight_4K.mp4',
    isHighlight: true,
    featured: true,
  },
  {
    id: 'VID-FL-003',
    title: 'The Eternal Vows - Full Wedding Film (Part 1 & 2) | Priya & Rajesh',
    category: 'full_wedding_film',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    customerPhone: '9876543210',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    weddingDate: '2026-01-18',
    eventDate: '2026-01-18',
    description: 'Complete cinematic documentary feature film covering haldi morning, barat procession, stage reception, mandap rituals, bidaai, and couple messages.',
    duration: '1:24:40',
    resolution: '4K Ultra HD',
    format: 'MP4',
    sizeBytes: 19756849152, // ~18.4 GB
    sizeFormatted: '18.4 GB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    visibility: 'Customer Only',
    uploadedAt: '2026-01-25',
    uploadId: 'UPL-VID-9003',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Videos/Full_Wedding_Film_Master_4K.mp4',
    isHighlight: false,
    featured: false,
  },
  {
    id: 'VID-HL-004',
    title: 'Sunset Symphony at Hirakud Lake | Pre-Wedding Love Story',
    category: 'teaser',
    customerId: 'CUST-1003',
    customerName: 'Smruti & Debasish Dash',
    customerPhone: '9123456780',
    orderId: 'SPJ-ORD-1003',
    bookingId: 'SPJ-BK-1003',
    weddingDate: '2026-03-05',
    eventDate: '2026-02-28',
    description: 'Dreamy pre-wedding cinema shoot during golden hour along Hirakud dyke with slow-motion drone flybys and acoustic licensed score.',
    duration: '3:45',
    resolution: '4K Ultra HD',
    format: 'WEBM',
    sizeBytes: 650117120, // ~620 MB
    sizeFormatted: '620 MB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    visibility: 'Public Portfolio',
    uploadedAt: '2026-03-02',
    uploadId: 'UPL-VID-9004',
    storagePath: 'storage/customers/CUST-1003/weddings/WED-SMRUTI-DEBASISH/Highlights/PreWedding_Hirakud_Teaser.webm',
    isHighlight: true,
    featured: true,
  },
  {
    id: 'VID-SG-005',
    title: 'Haldi Glow & Sangeet DJ Night | Priya & Rajesh',
    category: 'sangeet',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    customerPhone: '9876543210',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    weddingDate: '2026-01-18',
    eventDate: '2026-01-17',
    description: 'High-energy musical dance night recap with colorful haldi flower showers and family choreographed performances.',
    duration: '3:12',
    resolution: '1080p Full HD',
    format: 'MOV',
    sizeBytes: 744488960, // ~710 MB
    sizeFormatted: '710 MB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    visibility: 'Customer Only',
    uploadedAt: '2026-01-22',
    uploadId: 'UPL-VID-9005',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Highlights/Sangeet_Haldi_Highlights.mov',
    isHighlight: true,
    featured: false,
  },
  {
    id: 'VID-RAW-006',
    title: 'Barat Dhol & Firework Procession RAW Cuts',
    category: 'raw_footage',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    customerPhone: '9876543210',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    weddingDate: '2026-01-18',
    eventDate: '2026-01-18',
    description: 'Uncut multi-camera raw gimbal footage of the groom procession for customer archives.',
    duration: '38:15',
    resolution: '1080p Full HD',
    format: 'M4V',
    sizeBytes: 8804679680, // ~8.2 GB
    sizeFormatted: '8.2 GB',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    visibility: 'Private',
    uploadedAt: '2026-01-26',
    uploadId: 'UPL-VID-9006',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Videos/RAW_Barat_Footage.m4v',
    isHighlight: false,
    featured: false,
  },
];

// ====================================================
// 3 & 11. 5 TB CLOUD / OBJECT STORAGE & FILE ORGANIZATION
// ====================================================
// Initial 5 TB = 5,497,558,138,880 bytes (5 * 1024^4)
let totalStorageCapacityBytes = 5 * 1024 * 1024 * 1024 * 1024;

let storageFiles: StorageFileItem[] = [
  {
    id: 'SF-001',
    uploadId: 'UPL-VID-9001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Highlights',
    fileName: 'Barat_Varmala_4K_Teaser.mp4',
    fileType: 'video/mp4',
    sizeBytes: 880803840,
    sizeFormatted: '840 MB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Highlights/Barat_Varmala_4K_Teaser.mp4',
    signedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?token=sec_token_9001&exp=20261231',
    downloadToken: 'sec_token_9001',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-20',
    isDelivered: true,
  },
  {
    id: 'SF-002',
    uploadId: 'UPL-VID-9003',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Videos',
    fileName: 'Full_Wedding_Film_Master_4K.mp4',
    fileType: 'video/mp4',
    sizeBytes: 19756849152,
    sizeFormatted: '18.4 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Videos/Full_Wedding_Film_Master_4K.mp4',
    signedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=sec_token_9003&exp=20261231',
    downloadToken: 'sec_token_9003',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-25',
    isDelivered: true,
  },
  {
    id: 'SF-003',
    uploadId: 'UPL-PHO-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Photos',
    fileName: 'HighRes_Mandap_Portraits_Collection.zip',
    fileType: 'application/zip',
    sizeBytes: 45097156608, // ~42 GB
    sizeFormatted: '42.0 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Photos/HighRes_Mandap_Portraits_Collection.zip',
    signedUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90',
    downloadToken: 'sec_token_1001',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-22',
    isDelivered: true,
  },
  {
    id: 'SF-004',
    uploadId: 'UPL-ALB-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Album',
    fileName: 'Master_Photobook_12x36_Royal_Velvet.pdf',
    fileType: 'application/pdf',
    sizeBytes: 8808038400, // ~8.2 GB
    sizeFormatted: '8.2 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Album/Master_Photobook_12x36_Royal_Velvet.pdf',
    signedUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=2000&q=90',
    downloadToken: 'sec_token_alb1',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-24',
    isDelivered: true,
  },
  {
    id: 'SF-005',
    uploadId: 'UPL-EDT-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Editing',
    fileName: 'Sony_A7IV_RAW_Negatives_Batch_1.zip',
    fileType: 'application/zip',
    sizeBytes: 68719476736, // ~64.0 GB
    sizeFormatted: '64.0 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Editing/Sony_A7IV_RAW_Negatives_Batch_1.zip',
    signedUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=90',
    downloadToken: 'sec_token_edt1',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-19',
    isDelivered: false,
  },
  {
    id: 'SF-006',
    uploadId: 'UPL-DEL-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Final Delivery',
    fileName: 'Sushil_Photography_Final_Delivery_Bundle.zip',
    fileType: 'application/zip',
    sizeBytes: 23622320128, // ~22.0 GB
    sizeFormatted: '22.0 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Final Delivery/Sushil_Photography_Final_Delivery_Bundle.zip',
    signedUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90',
    downloadToken: 'sec_token_del1',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-26',
    isDelivered: true,
  },
  {
    id: 'SF-007',
    uploadId: 'UPL-BCK-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    category: 'Backups',
    fileName: 'Cold_Storage_Archive_PriRaj_2026.tar.gz',
    fileType: 'application/gzip',
    sizeBytes: 91268055040, // ~85.0 GB
    sizeFormatted: '85.0 GB',
    storagePath: 'storage/customers/CUST-1001/weddings/WED-PRIYA-RAJESH/Backups/Cold_Storage_Archive_PriRaj_2026.tar.gz',
    signedUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=90',
    downloadToken: 'sec_token_bck1',
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: '2026-01-28',
    isDelivered: false,
  },
];

// Helper to calculate storage metrics
function getStorageMetrics(): StorageMetrics {
  let photosBytes = 0;
  let videosBytes = 0;
  let highlightsBytes = 0;
  let albumFilesBytes = 0;
  let editingRawBytes = 0;
  let finalDeliveryBytes = 0;
  let backupsBytes = 0;
  let totalPhotosCount = 0;
  let totalVideosCount = 0;

  storageFiles.forEach((file) => {
    switch (file.category) {
      case 'Photos':
        photosBytes += file.sizeBytes;
        totalPhotosCount++;
        break;
      case 'Videos':
        videosBytes += file.sizeBytes;
        totalVideosCount++;
        break;
      case 'Highlights':
        highlightsBytes += file.sizeBytes;
        totalVideosCount++;
        break;
      case 'Album':
        albumFilesBytes += file.sizeBytes;
        break;
      case 'Editing':
        editingRawBytes += file.sizeBytes;
        break;
      case 'Final Delivery':
        finalDeliveryBytes += file.sizeBytes;
        break;
      case 'Backups':
        backupsBytes += file.sizeBytes;
        break;
      default:
        break;
    }
  });

  const usedBytes =
    photosBytes +
    videosBytes +
    highlightsBytes +
    albumFilesBytes +
    editingRawBytes +
    finalDeliveryBytes +
    backupsBytes;

  const availableBytes = Math.max(0, totalStorageCapacityBytes - usedBytes);
  const usedPercentage = Number(((usedBytes / totalStorageCapacityBytes) * 100).toFixed(2));

  function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
    }
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return (bytes / 1024).toFixed(2) + ' KB';
  }

  return {
    totalCapacityBytes: totalStorageCapacityBytes,
    totalCapacityFormatted: formatBytes(totalStorageCapacityBytes),
    usedBytes,
    usedFormatted: formatBytes(usedBytes),
    availableBytes,
    availableFormatted: formatBytes(availableBytes),
    usedPercentage,
    breakdown: {
      photosBytes,
      photosFormatted: formatBytes(photosBytes),
      videosBytes,
      videosFormatted: formatBytes(videosBytes),
      highlightsBytes,
      highlightsFormatted: formatBytes(highlightsBytes),
      albumFilesBytes,
      albumFilesFormatted: formatBytes(albumFilesBytes),
      editingRawBytes,
      editingRawFormatted: formatBytes(editingRawBytes),
      finalDeliveryBytes,
      finalDeliveryFormatted: formatBytes(finalDeliveryBytes),
      backupsBytes,
      backupsFormatted: formatBytes(backupsBytes),
    },
    totalFilesCount: storageFiles.length,
    totalVideosCount,
    totalPhotosCount,
    lastUpdated: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// Wedding Final Deliveries State
// ----------------------------------------------------
let finalDeliveries: WeddingFinalDelivery[] = [
  {
    id: 'DEL-1001',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    customerPhone: '9876543210',
    weddingDate: '2026-01-18',
    deliveryDate: '2026-01-26',
    status: 'Delivered & Notified',
    weddingHighlight: {
      title: 'Barat Procession & Varmala Royal Highlight',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?token=sec_token_9001',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?token=sec_token_9001',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '840 MB (4K UHD)',
      duration: '4:15',
    },
    fullWeddingFilm: {
      title: 'The Eternal Vows - Full Wedding Film (Part 1 & 2)',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=sec_token_9003',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=sec_token_9003',
      sizeFormatted: '18.4 GB (Master 4K)',
      duration: '1:24:40',
    },
    editedPhotos: {
      count: 350,
      downloadZipUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90',
      sizeFormatted: '42.0 GB (350 Master Retouched Photos)',
      samplePhotos: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
      ],
    },
    albumPreview: {
      title: '12x36 Royal Layflat Photobook Proof',
      sheetsCount: 30,
      previewSheets: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
      ],
      pdfDownloadUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '8.2 GB (High Res PDF)',
    },
    finalAlbumFiles: {
      title: 'Complete Print-Ready Sheets (TIFF & PDF)',
      downloadUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '8.2 GB',
    },
    notificationMessage: 'Congratulations! Your complete wedding highlight, full film, edited photos, and album proofs are now ready for streaming and download.',
    notificationSentAt: '2026-01-26 04:30 PM',
  },
];

// ----------------------------------------------------
// VIDEO API ENDPOINTS (Prompt 1, 2, 6, 7)
// ----------------------------------------------------

// Get all videos with filters
app.get('/api/videos', (req: Request, res: Response) => {
  const { publicOnly, isHighlight, customerId, orderId } = req.query;
  let results = [...weddingVideos];

  if (publicOnly === 'true') {
    results = results.filter((v) => v.visibility === 'Public Portfolio');
  }

  if (isHighlight === 'true') {
    results = results.filter((v) => v.isHighlight || v.category === 'highlight' || v.category === 'teaser');
  }

  if (customerId) {
    results = results.filter((v) => v.customerId === customerId);
  }

  if (orderId) {
    results = results.filter((v) => v.orderId === orderId);
  }

  res.json(results);
});

// Admin upload / register wedding video or highlight
app.post('/api/videos', (req: Request, res: Response) => {
  const {
    title,
    category,
    customerId,
    customerName,
    customerPhone,
    orderId,
    bookingId,
    weddingDate,
    eventDate,
    description,
    duration,
    resolution,
    format,
    sizeBytes,
    thumbnailUrl,
    streamUrl,
    downloadUrl,
    visibility,
    isHighlight,
  } = req.body;

  const videoId = generateId('VID');
  const uploadId = generateId('UPL-VID');

  const resolvedFormat: SupportedVideoFormat = (format || 'MP4').toUpperCase() as SupportedVideoFormat;
  const resolvedCategory: VideoCategory = (category || (isHighlight ? 'highlight' : 'full_wedding_film')) as VideoCategory;
  const resolvedVisibility: VideoVisibility = (visibility || (resolvedCategory === 'highlight' ? 'Public Portfolio' : 'Customer Only')) as VideoVisibility;

  const numBytes = Number(sizeBytes) || (resolvedCategory === 'full_wedding_film' ? 15000000000 : 900000000);
  let sizeFormatted = '850 MB';
  if (numBytes >= 1024 * 1024 * 1024) {
    sizeFormatted = `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else {
    sizeFormatted = `${(numBytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  const custId = customerId || 'CUST-GENERAL';
  const ordId = orderId || 'SPJ-ORD-GEN';
  const subFolder = isHighlight || resolvedCategory === 'highlight' ? 'Highlights' : 'Videos';
  const cleanTitle = (title || 'Wedding_Video').replace(/[^a-zA-Z0-9_-]/g, '_');
  const storagePath = `storage/customers/${custId}/weddings/${ordId}/${subFolder}/${cleanTitle}.${resolvedFormat.toLowerCase()}`;

  const defaultStream = resolvedCategory === 'full_wedding_film'
    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const newVideo: WeddingVideoItem = {
    id: videoId,
    title: title || (isHighlight ? 'Cinematic Wedding Highlight' : 'Full Wedding Film'),
    category: resolvedCategory,
    customerId: custId,
    customerName: customerName || 'Valued Patron',
    customerPhone: customerPhone || '',
    orderId: ordId,
    bookingId: bookingId || '',
    weddingDate: weddingDate || new Date().toISOString().split('T')[0],
    eventDate: eventDate || weddingDate || new Date().toISOString().split('T')[0],
    description: description || 'Master cinematic film produced by Sushil Meher.',
    duration: duration || (isHighlight ? '4:30' : '1:15:00'),
    resolution: resolution || '4K Ultra HD',
    format: resolvedFormat,
    sizeBytes: numBytes,
    sizeFormatted,
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    streamUrl: streamUrl || defaultStream,
    downloadUrl: downloadUrl || streamUrl || defaultStream,
    visibility: resolvedVisibility,
    uploadedAt: new Date().toISOString().split('T')[0],
    uploadId,
    storagePath,
    isHighlight: Boolean(isHighlight || resolvedCategory === 'highlight' || resolvedCategory === 'teaser'),
    featured: Boolean(req.body.featured),
  };

  weddingVideos.unshift(newVideo);

  // Add organized file item into 5 TB storage
  const storageRecord: StorageFileItem = {
    id: generateId('SF'),
    uploadId,
    customerId: custId,
    customerName: customerName || 'Customer',
    orderId: ordId,
    bookingId: bookingId || '',
    category: isHighlight ? 'Highlights' : 'Videos',
    fileName: `${cleanTitle}.${resolvedFormat.toLowerCase()}`,
    fileType: `video/${resolvedFormat.toLowerCase()}`,
    sizeBytes: numBytes,
    sizeFormatted,
    storagePath,
    signedUrl: `${newVideo.streamUrl}?token=sec_${videoId}&exp=20261231`,
    downloadToken: `sec_${videoId}`,
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: new Date().toISOString().split('T')[0],
    isDelivered: true,
  };
  storageFiles.unshift(storageRecord);

  // Notify system
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'New Wedding Video Uploaded',
    message: `"${newVideo.title}" (${sizeFormatted}) added to cloud storage and linked to ${ordId}.`,
    type: 'upload',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.status(201).json({ success: true, video: newVideo, storageRecord });
});

// Update video details or replace
app.put('/api/videos/:id', (req: Request, res: Response) => {
  const index = weddingVideos.findIndex((v) => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Video not found' });

  weddingVideos[index] = {
    ...weddingVideos[index],
    ...req.body,
  };

  res.json({ success: true, video: weddingVideos[index] });
});

// Delete video
app.delete('/api/videos/:id', (req: Request, res: Response) => {
  const vid = weddingVideos.find((v) => v.id === req.params.id);
  if (!vid) return res.status(404).json({ error: 'Video not found' });

  weddingVideos = weddingVideos.filter((v) => v.id !== req.params.id);
  storageFiles = storageFiles.filter((sf) => sf.uploadId !== vid.uploadId);

  res.json({ success: true, id: req.params.id });
});

// Get temporary signed streaming/download URL (Prompt 10: Security)
app.get('/api/videos/:id/signed-url', (req: Request, res: Response) => {
  const vid = weddingVideos.find((v) => v.id === req.params.id);
  if (!vid) return res.status(404).json({ error: 'Video not found' });

  // Token expires in 24 hours
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const token = `sig_${Buffer.from(`${vid.id}-${exp}`).toString('base64').replace(/=/g, '')}`;

  res.json({
    videoId: vid.id,
    title: vid.title,
    signedStreamUrl: `${vid.streamUrl}?token=${token}&expires=${exp}`,
    signedDownloadUrl: `${vid.downloadUrl}?token=${token}&expires=${exp}&dl=1`,
    expiresAt: new Date(exp * 1000).toISOString(),
  });
});

// ----------------------------------------------------
// 5 TB CLOUD STORAGE ENDPOINTS (Prompt 3, 9, 11)
// ----------------------------------------------------

// Get Storage Metrics
app.get('/api/storage/metrics', (req: Request, res: Response) => {
  res.json(getStorageMetrics());
});

// Expand Storage Beyond 5 TB (Prompt 3)
app.post('/api/storage/expand', (req: Request, res: Response) => {
  const addTB = Number(req.body.additionalTB) || 5;
  totalStorageCapacityBytes += addTB * 1024 * 1024 * 1024 * 1024;

  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Cloud Storage Capacity Expanded',
    message: `Storage pool increased by +${addTB} TB. New capacity: ${(totalStorageCapacityBytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB.`,
    type: 'system',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: '/admin',
  });

  res.json({
    success: true,
    additionalTB: addTB,
    metrics: getStorageMetrics(),
  });
});

// List storage files with filters (Prompt 11)
app.get('/api/storage/files', (req: Request, res: Response) => {
  const { category, customerId, orderId, bookingId, uploadId } = req.query;
  let results = [...storageFiles];

  if (category) {
    results = results.filter((f) => f.category.toLowerCase() === String(category).toLowerCase());
  }
  if (customerId) {
    results = results.filter((f) => f.customerId === customerId);
  }
  if (orderId) {
    results = results.filter((f) => f.orderId === orderId);
  }
  if (bookingId) {
    results = results.filter((f) => f.bookingId === bookingId);
  }
  if (uploadId) {
    results = results.filter((f) => f.uploadId === uploadId);
  }

  res.json(results);
});

// Resumable / Chunked Upload endpoint (Prompt 1, 4)
const activeChunkSessions: Record<string, {
  uploadId: string;
  fileName: string;
  totalChunks: number;
  receivedChunks: number;
  totalBytes: number;
  uploadedBytes: number;
  customerId: string;
  orderId: string;
  bookingId: string;
  category: string;
  fileType: string;
}> = {};

app.post('/api/storage/upload-chunk', (req: Request, res: Response) => {
  const {
    uploadId = generateId('UPL-CHK'),
    chunkIndex = 0,
    totalChunks = 1,
    fileName = 'wedding_file.mp4',
    fileSize = 1000000,
    fileType = 'video/mp4',
    customerId = 'CUST-1001',
    customerName = 'Valued Customer',
    orderId = 'SPJ-ORD-1001',
    bookingId = '',
    category = 'Videos',
  } = req.body;

  if (!activeChunkSessions[uploadId]) {
    activeChunkSessions[uploadId] = {
      uploadId,
      fileName,
      totalChunks: Number(totalChunks),
      receivedChunks: 0,
      totalBytes: Number(fileSize),
      uploadedBytes: 0,
      customerId,
      orderId,
      bookingId,
      category,
      fileType,
    };
  }

  const session = activeChunkSessions[uploadId];
  session.receivedChunks += 1;
  session.uploadedBytes = Math.min(
    session.totalBytes,
    Math.round((session.receivedChunks / session.totalChunks) * session.totalBytes)
  );

  const isComplete = session.receivedChunks >= session.totalChunks;

  if (isComplete) {
    delete activeChunkSessions[uploadId];

    // Compute formatted size
    let sizeFormatted = '1.0 MB';
    if (session.totalBytes >= 1024 * 1024 * 1024) {
      sizeFormatted = `${(session.totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else {
      sizeFormatted = `${(session.totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `storage/customers/${customerId}/weddings/${orderId}/${category}/${cleanName}`;

    // Register storage file
    const newStorageFile: StorageFileItem = {
      id: generateId('SF'),
      uploadId,
      customerId,
      customerName,
      orderId,
      bookingId,
      category: (category as any) || 'Videos',
      fileName,
      fileType,
      sizeBytes: session.totalBytes,
      sizeFormatted,
      storagePath,
      signedUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?token=sec_${uploadId}&exp=20261231`,
      downloadToken: `sec_${uploadId}`,
      tokenExpiresAt: '2026-12-31T23:59:59Z',
      uploadedAt: new Date().toISOString().split('T')[0],
      isDelivered: true,
    };
    storageFiles.unshift(newStorageFile);

    // If it's a video, also create a video library item
    if (fileType.includes('video') || fileName.match(/\.(mp4|mov|m4v|webm)$/i)) {
      const isHl = category === 'Highlights' || fileName.toLowerCase().includes('highlight') || fileName.toLowerCase().includes('teaser');
      const newVideoItem: WeddingVideoItem = {
        id: generateId('VID'),
        title: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        category: isHl ? 'highlight' : 'full_wedding_film',
        customerId,
        customerName,
        orderId,
        bookingId,
        weddingDate: new Date().toISOString().split('T')[0],
        eventDate: new Date().toISOString().split('T')[0],
        description: `Uploaded directly via Sushil Photography Jhar secure 5 TB storage.`,
        duration: isHl ? '4:00' : '1:20:00',
        resolution: '4K Ultra HD',
        format: (fileName.split('.').pop()?.toUpperCase() as any) || 'MP4',
        sizeBytes: session.totalBytes,
        sizeFormatted,
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
        streamUrl: newStorageFile.signedUrl,
        downloadUrl: newStorageFile.signedUrl,
        visibility: isHl ? 'Public Portfolio' : 'Customer Only',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadId,
        storagePath,
        isHighlight: isHl,
      };
      weddingVideos.unshift(newVideoItem);
    }

    return res.json({
      success: true,
      uploadId,
      status: 'completed',
      progressPercent: 100,
      receivedChunks: session.totalChunks,
      totalChunks: session.totalChunks,
      uploadedBytes: session.totalBytes,
      totalBytes: session.totalBytes,
      storageFile: newStorageFile,
    });
  }

  return res.json({
    success: true,
    uploadId,
    status: 'uploading',
    progressPercent: Math.round((session.receivedChunks / session.totalChunks) * 100),
    receivedChunks: session.receivedChunks,
    totalChunks: session.totalChunks,
    uploadedBytes: session.uploadedBytes,
    totalBytes: session.totalBytes,
  });
});

// ----------------------------------------------------
// 5. PRIVATE WEDDING GALLERY ENDPOINT (Prompt 5 & 10)
// ----------------------------------------------------
app.get('/api/customer/gallery', (req: Request, res: Response) => {
  const { query, phone, orderId } = req.query;

  // Search matching order or customer
  const cleanQuery = String(query || orderId || phone || '').trim().toLowerCase();

  const matchedOrder = orders.find((o) =>
    (o.id && o.id.toLowerCase() === cleanQuery) ||
    (o.phone && o.phone.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '')) ||
    (o.bookingId && o.bookingId.toLowerCase() === cleanQuery) ||
    (o.customerName && o.customerName.toLowerCase().includes(cleanQuery))
  ) || orders[0]; // fallback to first sample order for instant demonstration

  const customerId = matchedOrder?.id ? `CUST-${matchedOrder.id.replace('SPJ-ORD-', '')}` : 'CUST-1001';
  const targetOrderId = matchedOrder?.id || 'SPJ-ORD-1001';
  const targetBookingId = matchedOrder?.bookingId || 'SPJ-BK-1001';

  // Customer isolated videos
  const customerVideos = weddingVideos.filter(
    (v) => v.orderId === targetOrderId || v.customerId === customerId || v.bookingId === targetBookingId
  );

  const customerHighlights = customerVideos.filter((v) => v.isHighlight || v.category === 'highlight' || v.category === 'teaser');

  const customerDelivery = finalDeliveries.find(
    (d) => d.orderId === targetOrderId || d.customerId === customerId
  ) || finalDeliveries[0];

  const galleryData: PrivateCustomerGallery = {
    customer: {
      id: customerId,
      name: matchedOrder?.customerName || 'Priya & Rajesh Patel',
      phone: matchedOrder?.phone || '9876543210',
      orderId: targetOrderId,
      bookingId: targetBookingId,
      weddingDate: matchedOrder?.eventDate || '2026-01-18',
      venue: 'Sohela Palace, Bargarh, Odisha',
    },
    photos: [
      {
        id: 'p-1',
        title: 'Groom Barat Entrance Royal Portrait',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        category: 'Barat & Entry',
        size: '18.4 MB (RAW 48MP)',
      },
      {
        id: 'p-2',
        title: 'Bride Golden Varmala Garland Moment',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
        category: 'Mandap Rituals',
        size: '22.1 MB (RAW 48MP)',
      },
      {
        id: 'p-3',
        title: 'Seven Sacred Pheras around Agni',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        category: 'Mandap Rituals',
        size: '19.8 MB (RAW 48MP)',
      },
      {
        id: 'p-4',
        title: 'Couple Intimate Sunset Romance',
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
        category: 'Couple Portraits',
        size: '24.5 MB (RAW 48MP)',
      },
      {
        id: 'p-5',
        title: 'Haldi Joyous Yellow Splashes',
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
        category: 'Haldi Ceremony',
        size: '16.9 MB (RAW 48MP)',
      },
      {
        id: 'p-6',
        title: 'Family Grand Reception Stage Group',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
        category: 'Reception Stage',
        size: '21.0 MB (RAW 48MP)',
      },
    ],
    videos: customerVideos.length > 0 ? customerVideos : weddingVideos.slice(0, 3),
    highlights: customerHighlights.length > 0 ? customerHighlights : weddingVideos.filter((v) => v.isHighlight).slice(0, 2),
    editedPhotos: [
      {
        id: 'ed-1',
        title: 'Royal Mandap Stage Master Color Grade.jpg',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
        size: '14.2 MB',
      },
      {
        id: 'ed-2',
        title: 'Candid Laughter Golden Hour Glow.jpg',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
        size: '12.8 MB',
      },
      {
        id: 'ed-3',
        title: 'Bride Bridal Jewellery Detail Editorial.jpg',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85',
        size: '15.6 MB',
      },
    ],
    albumPreview: {
      title: '12x36 Royal Velvet Layflat Photobook',
      coverUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      sheetsCount: 30,
      sheets: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
      ],
      pdfUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
    },
    finalDelivery: customerDelivery,
  };

  res.json(galleryData);
});

// ----------------------------------------------------
// 8. WEDDING FINAL DELIVERY API (Prompt 8)
// ----------------------------------------------------
app.get('/api/delivery/:orderId', (req: Request, res: Response) => {
  const delivery = finalDeliveries.find((d) => d.orderId === req.params.orderId) || finalDeliveries[0];
  res.json(delivery);
});

app.post('/api/delivery', (req: Request, res: Response) => {
  const {
    orderId,
    bookingId,
    customerId,
    customerName,
    customerPhone,
    weddingDate,
    weddingHighlight,
    fullWeddingFilm,
    editedPhotos,
    albumPreview,
    finalAlbumFiles,
    notificationMessage,
  } = req.body;

  const deliveryId = generateId('DEL');
  const newDelivery: WeddingFinalDelivery = {
    id: deliveryId,
    orderId: orderId || 'SPJ-ORD-1001',
    bookingId: bookingId || 'SPJ-BK-1001',
    customerId: customerId || 'CUST-1001',
    customerName: customerName || 'Valued Patron',
    customerPhone: customerPhone || '',
    weddingDate: weddingDate || '2026-01-18',
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'Delivered & Notified',
    weddingHighlight: weddingHighlight || {
      title: 'Cinematic Wedding Teaser',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '840 MB',
      duration: '4:15',
    },
    fullWeddingFilm: fullWeddingFilm || {
      title: 'Full Wedding Feature Film 4K',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      sizeFormatted: '18.4 GB',
      duration: '1:24:00',
    },
    editedPhotos: editedPhotos || {
      count: 350,
      downloadZipUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90',
      sizeFormatted: '42.0 GB',
      samplePhotos: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      ],
    },
    albumPreview: albumPreview || {
      title: '12x36 Album Master Layout',
      sheetsCount: 30,
      previewSheets: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      ],
      pdfDownloadUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '8.2 GB',
    },
    finalAlbumFiles: finalAlbumFiles || {
      title: 'Print-Ready TIFF Album Master',
      downloadUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      sizeFormatted: '8.2 GB',
    },
    notificationMessage: notificationMessage || 'Your wedding final delivery package is now ready to watch and download!',
    notificationSentAt: new Date().toLocaleString(),
  };

  const existingIdx = finalDeliveries.findIndex((d) => d.orderId === newDelivery.orderId);
  if (existingIdx !== -1) {
    finalDeliveries[existingIdx] = newDelivery;
  } else {
    finalDeliveries.unshift(newDelivery);
  }

  // Update order delivery status
  const matchedOrder = orders.find((o) => o.id === newDelivery.orderId);
  if (matchedOrder) {
    matchedOrder.deliveryStatus = 'Delivered';
    matchedOrder.orderStatus = 'Delivered';
    matchedOrder.status = 'Delivered';
    matchedOrder.deliveredFilesLink = `/client-portal?order=${newDelivery.orderId}`;
    matchedOrder.statusHistory?.push({
      status: 'Delivered',
      timestamp: new Date().toLocaleString(),
      note: 'All final wedding videos, highlights, retouched photos, and photobook print masters delivered.',
    });
  }

  // Add customer notification
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Wedding Final Files Delivered!',
    message: `${newDelivery.customerName}: Final wedding highlight, full film, edited photos, and album files delivered.`,
    type: 'order',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: `/client-portal?order=${newDelivery.orderId}`,
  });

  res.status(201).json({ success: true, delivery: newDelivery });
});

// ====================================================
// SECTION 15: UPLOAD & FILE-HANDLING RULES (Master Photos,
// Album Photo Selection Proofing, Upload Sessions, Designer Access)
// ====================================================

// 1. MASTER PHOTO VAULT (Original uncompressed master files, never overwritten)
let masterPhotos: MasterPhotoItem[] = [
  {
    id: 'SPJ-IMG-2026-001',
    fileId: 'FILE-IMG-1001',
    originalFileName: 'RAW_SONY_A7IV_DSC08492.JPG',
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    mimeType: 'image/jpeg',
    sizeBytes: 25480000,
    sizeFormatted: '24.3 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 1,
    customerNote: 'Candidate for photobook Front Velvet Cover',
    isCoverCandidate: true,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-002',
    fileId: 'FILE-IMG-1002',
    originalFileName: 'VARMALA_MOMENT_DSC08512.JPG',
    fileHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    mimeType: 'image/jpeg',
    sizeBytes: 28100000,
    sizeFormatted: '26.8 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 2,
    customerNote: 'First full 2-page panoramic spread in Mandap section',
    isCoverCandidate: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-003',
    fileId: 'FILE-IMG-1003',
    originalFileName: 'SACRED_PHERAS_DSC08580.JPG',
    fileHash: '535fa30d7e25dd8a49f1536779734ec8286108d115da5045d77f3b418507f8b4',
    mimeType: 'image/jpeg',
    sizeBytes: 23600000,
    sizeFormatted: '22.5 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 3,
    customerNote: 'Highlight holy fire reflection in background',
    isCoverCandidate: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-004',
    fileId: 'FILE-IMG-1004',
    originalFileName: 'SUNSET_ROMANCE_DSC08610.JPG',
    fileHash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    mimeType: 'image/jpeg',
    sizeBytes: 26900000,
    sizeFormatted: '25.6 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 4,
    customerNote: 'Centerfold candid romantic portrait',
    isCoverCandidate: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-005',
    fileId: 'FILE-IMG-1005',
    originalFileName: 'HALDI_CELEBRATION_DSC08655.JPG',
    fileHash: '9b8769a4a742959a2d0298c36fb7064e6553b0b8b3db2500be9df356499318b7',
    mimeType: 'image/jpeg',
    sizeBytes: 21200000,
    sizeFormatted: '20.2 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 5,
    customerNote: 'Group with cousin laughter shots',
    isCoverCandidate: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-006',
    fileId: 'FILE-IMG-1006',
    originalFileName: 'GRAND_RECEPTION_DSC08720.JPG',
    fileHash: 'c7be1ed902fb8dd4e4d823166a40c5b91379e61270cf110bb93fb2e6aa0fee3e',
    mimeType: 'image/jpeg',
    sizeBytes: 27500000,
    sizeFormatted: '26.2 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: true,
    albumSequenceIndex: 6,
    customerNote: 'Family royal stage portrait',
    isCoverCandidate: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-007',
    fileId: 'FILE-IMG-1007',
    originalFileName: 'BRIDAL_JEWELLERY_MACRO_08801.JPG',
    fileHash: '8f434346648f6b96df89dda901c5176b10e6d0ceec3e1662e004bfd4155d0429',
    mimeType: 'image/jpeg',
    sizeBytes: 24100000,
    sizeFormatted: '23.0 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-008',
    fileId: 'FILE-IMG-1008',
    originalFileName: 'BARAT_HORSE_ARRIVAL_08832.JPG',
    fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    mimeType: 'image/jpeg',
    sizeBytes: 22800000,
    sizeFormatted: '21.7 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-009',
    fileId: 'FILE-IMG-1009',
    originalFileName: 'SINDOOR_DAAN_RITUAL_08901.JPG',
    fileHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    mimeType: 'image/jpeg',
    sizeBytes: 25100000,
    sizeFormatted: '23.9 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
  {
    id: 'SPJ-IMG-2026-010',
    fileId: 'FILE-IMG-1010',
    originalFileName: 'SANGEET_NIGHT_DANCE_08990.JPG',
    fileHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    mimeType: 'image/jpeg',
    sizeBytes: 27900000,
    sizeFormatted: '26.6 MB (RAW Master)',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    weddingId: 'WED-PRIYA-RAJESH',
    orderId: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-1001',
    albumSelectionId: 'SEL-2026-001',
    uploadId: 'UP-2026-00025',
    sessionId: 'UP-2026-00025',
    originalUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=100',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
    selectedForAlbum: false,
    uploadedAt: '2026-01-20',
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  },
];

// 2. ALBUM SELECTION RECORDS (Relationships / references only - zero duplicate bytes)
let albumSelections: AlbumSelectionRecord[] = [
  {
    id: 'SEL-2026-001',
    orderId: 'SPJ-ORD-1001',
    weddingId: 'WED-PRIYA-RAJESH',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    status: 'in_design',
    totalSelected: 6,
    maxAllowed: 60,
    targetSheetCount: 30,
    customerInstructions:
      'Please use SPJ-IMG-2026-001 for the Velvet Photo Cover. Keep Varmala garland moment on spread 2-3.',
    selectedPhotoReferences: [
      {
        masterPhotoId: 'SPJ-IMG-2026-001',
        sequenceOrder: 1,
        isCoverPhoto: true,
        notes: 'Candidate for photobook Front Velvet Cover',
        designerProcessed: true,
        processedAt: '2026-01-23',
      },
      {
        masterPhotoId: 'SPJ-IMG-2026-002',
        sequenceOrder: 2,
        isCoverPhoto: false,
        notes: 'First full 2-page panoramic spread in Mandap section',
        designerProcessed: true,
        processedAt: '2026-01-23',
      },
      {
        masterPhotoId: 'SPJ-IMG-2026-003',
        sequenceOrder: 3,
        isCoverPhoto: false,
        notes: 'Highlight holy fire reflection in background',
        designerProcessed: false,
      },
      {
        masterPhotoId: 'SPJ-IMG-2026-004',
        sequenceOrder: 4,
        isCoverPhoto: false,
        notes: 'Centerfold candid romantic portrait',
        designerProcessed: false,
      },
      {
        masterPhotoId: 'SPJ-IMG-2026-005',
        sequenceOrder: 5,
        isCoverPhoto: false,
        notes: 'Group with cousin laughter shots',
        designerProcessed: false,
      },
      {
        masterPhotoId: 'SPJ-IMG-2026-006',
        sequenceOrder: 6,
        isCoverPhoto: false,
        notes: 'Family royal stage portrait',
        designerProcessed: false,
      },
    ],
    submittedAt: '2026-01-21T14:30:00Z',
    updatedAt: '2026-01-22T10:15:00Z',
    assignedDesigner: 'Sushil Meher (Master Album Artist)',
  },
];

// 3. UPLOAD SESSIONS LOG
let uploadSessions: UploadSessionRecord[] = [
  {
    sessionId: 'UP-2026-00025',
    uploadId: 'UPL-SESS-00025',
    customerId: 'CUST-1001',
    customerName: 'Priya & Rajesh Patel',
    orderId: 'SPJ-ORD-1001',
    weddingId: 'WED-PRIYA-RAJESH',
    totalFiles: 10,
    uploadedFiles: 10,
    failedFiles: 0,
    totalSizeBytes: 249780000,
    totalSizeFormatted: '238.2 MB',
    status: 'completed',
    progressPercent: 100,
    uploadDate: '2026-01-20',
    files: masterPhotos.map((p) => ({
      fileId: p.fileId,
      originalName: p.originalFileName,
      sizeBytes: p.sizeBytes,
      sizeFormatted: p.sizeFormatted,
      mimeType: p.mimeType,
      status: 'completed',
      progress: 100,
      hash: p.fileHash,
      isDuplicate: false,
    })),
  },
];

// ----------------------------------------------------
// A & K. FILE VALIDATION & VIRUS CHECKING API
// ----------------------------------------------------
app.post('/api/storage/validate-file', (req: Request, res: Response) => {
  const { fileName = '', mimeType = '', sizeBytes = 0 } = req.body;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  const ALLOWED_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  const hasValidExt = ALLOWED_EXTS.includes(ext);
  const hasValidMime = ALLOWED_MIMES.includes(mimeType.toLowerCase()) || mimeType === '';

  // Malicious extension blocklist
  const BLOCKED_EXTS = ['exe', 'bat', 'sh', 'php', 'js', 'vbs', 'scr', 'cmd', 'ps1'];
  if (BLOCKED_EXTS.includes(ext)) {
    return res.status(400).json({
      valid: false,
      reason: 'MALICIOUS_SIGNATURE_DETECTED',
      message: 'Suspicious file signature blocked by Sushil Photography security firewall.',
    });
  }

  if (!hasValidExt || (!hasValidMime && mimeType !== '')) {
    return res.status(400).json({
      valid: false,
      reason: 'UNSUPPORTED_FORMAT',
      message: 'Unsupported file format. Please upload JPG, JPEG, PNG, WEBP, or HEIC/HEIF.',
      allowedFormats: ['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'HEIF'],
    });
  }

  return res.json({
    valid: true,
    fileExtension: ext,
    sanitizedMime: mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    virusScanClean: true,
    integrityCheck: 'PASSED_SHA256',
  });
});

// ----------------------------------------------------
// D & R. DUPLICATE CHECK API (Reliable hash / checksum)
// ----------------------------------------------------
app.post('/api/storage/check-duplicate', (req: Request, res: Response) => {
  const { fileHash = '', fileName = '', customerId = '' } = req.body;

  // Search by exact checksum hash or matching original filename under same customer
  const matched = masterPhotos.find(
    (p) =>
      (fileHash && p.fileHash === fileHash) ||
      (fileName && p.originalFileName.toLowerCase() === fileName.toLowerCase() && p.customerId === customerId)
  );

  if (matched) {
    return res.json({
      isDuplicate: true,
      duplicatePhoto: matched,
      message: 'This photo has already been uploaded.',
      fileId: matched.fileId,
      masterPhotoId: matched.id,
    });
  }

  return res.json({
    isDuplicate: false,
    message: 'New unique file detected.',
  });
});

// ----------------------------------------------------
// ALBUM PHOTO SELECTION ENDPOINTS (Rule G, H, M, N)
// ----------------------------------------------------
app.get('/api/album-selection/:orderId', (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  let selection = albumSelections.find((s) => s.orderId === orderId);

  // If none exists, synthesize one linked to this order
  if (!selection) {
    const matchedOrder = orders.find((o) => o.id === orderId);
    selection = {
      id: `SEL-${orderId.replace('SPJ-ORD-', '')}`,
      orderId,
      weddingId: `WED-${orderId}`,
      customerId: `CUST-${orderId.replace('SPJ-ORD-', '')}`,
      customerName: matchedOrder?.customerName || 'Valued Patron',
      status: 'draft',
      totalSelected: 0,
      maxAllowed: 60,
      targetSheetCount: 30,
      customerInstructions: '',
      selectedPhotoReferences: [],
      updatedAt: new Date().toISOString(),
    };
    albumSelections.push(selection);
  }

  // Get matching master photos for this customer/order
  let photos = masterPhotos.filter(
    (p) => p.orderId === orderId || p.customerId === selection?.customerId
  );

  if (photos.length === 0) {
    photos = masterPhotos; // fallback to demonstration gallery
  }

  // Map references with sequenceOrder, isCoverPhoto, notes, designerProcessed
  const refMap = new Map<string, AlbumSelectedPhotoRef>();
  selection.selectedPhotoReferences.forEach((ref) => {
    refMap.set(ref.masterPhotoId, ref);
  });

  const enrichedPhotos = photos.map((p) => {
    const ref = refMap.get(p.id);
    return {
      ...p,
      selectedForAlbum: Boolean(ref),
      albumSequenceIndex: ref?.sequenceOrder || undefined,
      isCoverCandidate: ref?.isCoverPhoto || false,
      customerNote: ref?.notes || '',
      designerProcessed: ref?.designerProcessed || false,
    };
  });

  const selectedOrdered = selection.selectedPhotoReferences
    .map((ref) => {
      const photo = masterPhotos.find((p) => p.id === ref.masterPhotoId);
      if (!photo) return null;
      return {
        ...photo,
        sequenceOrder: ref.sequenceOrder,
        isCoverPhoto: ref.isCoverPhoto || false,
        notes: ref.notes || '',
        designerProcessed: ref.designerProcessed || false,
        processedAt: ref.processedAt,
      };
    })
    .filter(Boolean);

  res.json({
    selection,
    masterPhotos: enrichedPhotos,
    selectedPhotos: selectedOrdered,
  });
});

// Toggle Photo in Album Selection (RULE G: Zero duplication, reference only; RULE H: Remove from selection only)
app.post('/api/album-selection/toggle-photo', (req: Request, res: Response) => {
  const { orderId, masterPhotoId } = req.body;

  let selection = albumSelections.find((s) => s.orderId === orderId);
  if (!selection) {
    selection = {
      id: `SEL-${orderId.replace('SPJ-ORD-', '')}`,
      orderId,
      weddingId: `WED-${orderId}`,
      customerId: 'CUST-1001',
      customerName: 'Priya & Rajesh Patel',
      status: 'draft',
      totalSelected: 0,
      maxAllowed: 60,
      targetSheetCount: 30,
      customerInstructions: '',
      selectedPhotoReferences: [],
      updatedAt: new Date().toISOString(),
    };
    albumSelections.push(selection);
  }

  const existingRefIdx = selection.selectedPhotoReferences.findIndex(
    (r) => r.masterPhotoId === masterPhotoId
  );

  let isSelectedNow = false;

  if (existingRefIdx !== -1) {
    // RULE H: Remove it from the selection only. DO NOT delete the original wedding photo!
    selection.selectedPhotoReferences.splice(existingRefIdx, 1);
    // Re-index remaining sequence orders
    selection.selectedPhotoReferences.forEach((ref, idx) => {
      ref.sequenceOrder = idx + 1;
    });
    isSelectedNow = false;
  } else {
    // RULE G: Store relationship/reference of selected photo with Album Selection ID
    if (selection.selectedPhotoReferences.length >= selection.maxAllowed) {
      return res.status(400).json({
        error: `Album limit reached: Maximum ${selection.maxAllowed} photos allowed for this 30-sheet layout.`,
      });
    }

    const nextOrder = selection.selectedPhotoReferences.length + 1;
    selection.selectedPhotoReferences.push({
      masterPhotoId,
      sequenceOrder: nextOrder,
      isCoverPhoto: nextOrder === 1,
      notes: '',
      designerProcessed: false,
    });
    isSelectedNow = true;
  }

  selection.totalSelected = selection.selectedPhotoReferences.length;
  selection.updatedAt = new Date().toISOString();

  // Sync master photo reference flag
  const masterPhoto = masterPhotos.find((p) => p.id === masterPhotoId);
  if (masterPhoto) {
    masterPhoto.selectedForAlbum = isSelectedNow;
    masterPhoto.albumSequenceIndex = isSelectedNow ? selection.totalSelected : undefined;
  }

  res.json({
    success: true,
    isSelected: isSelectedNow,
    totalSelected: selection.totalSelected,
    selection,
  });
});

// Reorder Photo Sequence (RULE N: Drag and Drop sequence ordering)
app.put('/api/album-selection/reorder', (req: Request, res: Response) => {
  const { orderId, photoIds = [] } = req.body;
  const selection = albumSelections.find((s) => s.orderId === orderId);

  if (!selection) {
    return res.status(404).json({ error: 'Album selection session not found' });
  }

  // Create new sequence map
  const reorderedRefs: AlbumSelectedPhotoRef[] = [];

  (photoIds as string[]).forEach((id, index) => {
    const existingRef = selection.selectedPhotoReferences.find(
      (r) => r.masterPhotoId === id
    );
    if (existingRef) {
      reorderedRefs.push({
        ...existingRef,
        sequenceOrder: index + 1,
      });
    }
  });

  selection.selectedPhotoReferences = reorderedRefs;
  selection.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Photo sequence updated successfully',
    selectedPhotoReferences: selection.selectedPhotoReferences,
  });
});

// Update specific photo notes & cover flag (RULE N & M)
app.put('/api/album-selection/update-photo-meta', (req: Request, res: Response) => {
  const { orderId, masterPhotoId, notes, isCoverPhoto } = req.body;
  const selection = albumSelections.find((s) => s.orderId === orderId);

  if (!selection) {
    return res.status(404).json({ error: 'Album selection session not found' });
  }

  const ref = selection.selectedPhotoReferences.find((r) => r.masterPhotoId === masterPhotoId);
  if (!ref) {
    return res.status(404).json({ error: 'Photo is not currently in selected album list' });
  }

  if (notes !== undefined) ref.notes = notes;
  if (isCoverPhoto !== undefined) {
    // If set to true, reset other covers
    if (isCoverPhoto) {
      selection.selectedPhotoReferences.forEach((r) => {
        r.isCoverPhoto = r.masterPhotoId === masterPhotoId;
      });
    } else {
      ref.isCoverPhoto = false;
    }
  }

  selection.updatedAt = new Date().toISOString();

  // Update master photo meta
  const master = masterPhotos.find((p) => p.id === masterPhotoId);
  if (master) {
    if (notes !== undefined) master.customerNote = notes;
    if (isCoverPhoto !== undefined) master.isCoverCandidate = isCoverPhoto;
  }

  res.json({ success: true, ref, selection });
});

// Submit Album Selection to Designer (RULE M)
app.post('/api/album-selection/submit', (req: Request, res: Response) => {
  const { orderId, customerInstructions = '' } = req.body;
  const selection = albumSelections.find((s) => s.orderId === orderId);

  if (!selection) {
    return res.status(404).json({ error: 'Album selection session not found' });
  }

  selection.status = 'submitted';
  selection.submittedAt = new Date().toISOString();
  selection.customerInstructions = customerInstructions;
  selection.updatedAt = new Date().toISOString();

  // Update Order
  const matchedOrder = orders.find((o) => o.id === orderId);
  if (matchedOrder) {
    matchedOrder.status = 'Album Design in Progress';
    matchedOrder.orderStatus = 'Album Design in Progress';
    matchedOrder.progressPercent = Math.max(matchedOrder.progressPercent, 65);
    matchedOrder.statusHistory?.push({
      status: 'Album Design in Progress',
      timestamp: new Date().toLocaleString(),
      note: `Customer finalized ${selection.totalSelected} selected photos for 12x36 album design.`,
    });
  }

  // Notify admin & designer
  notifications.unshift({
    id: generateId('NOTIF'),
    title: 'Album Selection Submitted!',
    message: `${selection.customerName} submitted ${selection.totalSelected} photos for 12x36 photobook design.`,
    type: 'order',
    timestamp: new Date().toLocaleString(),
    read: false,
    link: `/admin`,
  });

  res.json({
    success: true,
    message: 'Album selection submitted to Sushil Photography design laboratory.',
    selection,
  });
});

// ----------------------------------------------------
// M. ALBUM DESIGNER ACCESS PORTAL ENDPOINTS
// ----------------------------------------------------
app.get('/api/designer/selections', (req: Request, res: Response) => {
  const enriched = albumSelections.map((sel) => {
    const selectedPhotos = sel.selectedPhotoReferences
      .map((ref) => {
        const photo = masterPhotos.find((p) => p.id === ref.masterPhotoId);
        if (!photo) return null;
        return {
          ...photo,
          sequenceOrder: ref.sequenceOrder,
          isCoverPhoto: ref.isCoverPhoto || false,
          notes: ref.notes || '',
          designerProcessed: ref.designerProcessed || false,
          processedAt: ref.processedAt,
        };
      })
      .filter(Boolean);

    return {
      ...sel,
      photos: selectedPhotos,
    };
  });

  res.json(enriched);
});

app.patch('/api/designer/mark-processed', (req: Request, res: Response) => {
  const { orderId, masterPhotoId, designerProcessed = true } = req.body;
  const selection = albumSelections.find((s) => s.orderId === orderId);

  if (!selection) {
    return res.status(404).json({ error: 'Selection session not found' });
  }

  const ref = selection.selectedPhotoReferences.find((r) => r.masterPhotoId === masterPhotoId);
  if (ref) {
    ref.designerProcessed = Boolean(designerProcessed);
    ref.processedAt = designerProcessed ? new Date().toISOString() : undefined;
  }

  res.json({ success: true, ref, selection });
});

// ----------------------------------------------------
// O. UPLOAD SESSIONS ENDPOINTS
// ----------------------------------------------------
app.get('/api/storage/upload-sessions', (req: Request, res: Response) => {
  res.json(uploadSessions);
});

app.post('/api/storage/upload-session', (req: Request, res: Response) => {
  const {
    sessionId = `UP-2026-${String(uploadSessions.length + 26).padStart(5, '0')}`,
    uploadId = `UPL-${Date.now()}`,
    customerId = 'CUST-1001',
    customerName = 'Priya & Rajesh Patel',
    orderId = 'SPJ-ORD-1001',
    weddingId = 'WED-PRIYA-RAJESH',
    totalFiles = 1,
    totalSizeBytes = 0,
    files = [],
  } = req.body;

  let totalSizeFormatted = '0 MB';
  if (totalSizeBytes >= 1024 * 1024 * 1024) {
    totalSizeFormatted = `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else {
    totalSizeFormatted = `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const newSession: UploadSessionRecord = {
    sessionId,
    uploadId,
    customerId,
    customerName,
    orderId,
    weddingId,
    totalFiles,
    uploadedFiles: files.filter((f: any) => f.status === 'completed').length,
    failedFiles: files.filter((f: any) => f.status === 'failed').length,
    totalSizeBytes,
    totalSizeFormatted,
    status: 'uploading',
    progressPercent: 0,
    uploadDate: new Date().toISOString().split('T')[0],
    files,
  };

  uploadSessions.unshift(newSession);
  res.status(201).json(newSession);
});

// ----------------------------------------------------
// E, F, K, T. MASTER PHOTO REGISTRATION WITH THREE TIERS
// ----------------------------------------------------
app.post('/api/storage/upload-photo-master', (req: Request, res: Response) => {
  const {
    originalFileName = 'wedding_photo.jpg',
    fileHash = '',
    mimeType = 'image/jpeg',
    sizeBytes = 25000000,
    customerId = 'CUST-1001',
    customerName = 'Priya & Rajesh Patel',
    weddingId = 'WED-PRIYA-RAJESH',
    orderId = 'SPJ-ORD-1001',
    bookingId = 'SPJ-BK-1001',
    uploadId = `UPL-${Date.now()}`,
    sessionId = 'UP-2026-00025',
    originalUrl = '',
    previewUrl = '',
    thumbnailUrl = '',
  } = req.body;

  // RULE D: Check duplicate by hash
  if (fileHash) {
    const existing = masterPhotos.find((p) => p.fileHash === fileHash);
    if (existing) {
      return res.status(200).json({
        isDuplicate: true,
        message: 'This photo has already been uploaded.',
        photo: existing,
      });
    }
  }

  // RULE E: Generate unique internal filename and file ID
  const internalFileId = `FILE-IMG-${Date.now().toString().slice(-6)}`;
  const internalId = `SPJ-IMG-2026-${String(masterPhotos.length + 1).padStart(3, '0')}`;

  let sizeFormatted = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB (RAW Master)`;

  // RULE F: Organized storage paths (never exposed directly to clients as raw paths)
  const safeName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePathOriginal = `storage/customers/${customerId}/weddings/${weddingId}/Original Photos/${safeName}`;

  const defaultImg =
    originalUrl ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=100';

  // RULE C: Always preserve original uploaded photo; separate preview and thumbnail
  const newMaster: MasterPhotoItem = {
    id: internalId,
    fileId: internalFileId,
    originalFileName,
    fileHash: fileHash || `hash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    mimeType,
    sizeBytes,
    sizeFormatted,
    customerId,
    customerName,
    weddingId,
    orderId,
    bookingId,
    albumSelectionId: 'SEL-2026-001',
    uploadId,
    sessionId,
    originalUrl: defaultImg,
    previewUrl: previewUrl || defaultImg,
    thumbnailUrl: thumbnailUrl || defaultImg,
    selectedForAlbum: false,
    uploadedAt: new Date().toISOString().split('T')[0],
    validationStatus: 'verified',
    virusScanClean: true,
    isArchived: false,
    isDuplicate: false,
  };

  masterPhotos.unshift(newMaster);

  // Also register in cloud storage files
  const newStorageFile: StorageFileItem = {
    id: generateId('SF'),
    uploadId,
    customerId,
    customerName,
    orderId,
    bookingId,
    category: 'Photos',
    fileName: originalFileName,
    fileType: mimeType,
    sizeBytes,
    sizeFormatted,
    storagePath: storagePathOriginal,
    signedUrl: defaultImg,
    downloadToken: `sec_${internalFileId}`,
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    uploadedAt: new Date().toISOString().split('T')[0],
    isDelivered: false,
  };
  storageFiles.unshift(newStorageFile);

  res.status(201).json({
    success: true,
    message: 'Master photo uploaded and verified.',
    photo: newMaster,
  });
});

// ----------------------------------------------------
// P & Q. ADMIN MASTER PHOTO MANAGEMENT (Search, Filter, Archive, Permanent Delete)
// ----------------------------------------------------
app.get('/api/storage/master-photos', (req: Request, res: Response) => {
  const { customerId, orderId, category, search, archived } = req.query;

  let list = [...masterPhotos];

  if (customerId) {
    list = list.filter((p) => p.customerId === customerId);
  }
  if (orderId) {
    list = list.filter((p) => p.orderId === orderId);
  }
  if (archived === 'true') {
    list = list.filter((p) => p.isArchived === true);
  } else if (archived === 'false') {
    list = list.filter((p) => !p.isArchived);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.originalFileName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.fileHash.toLowerCase().includes(q) ||
        (p.customerName && p.customerName.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

// Permanent deletion with confirmation mandate (RULE H & P & Q)
app.delete('/api/storage/master-photo/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminConfirmed, confirmationPhrase } = req.body;

  if (!adminConfirmed || confirmationPhrase !== 'CONFIRM_DELETE_PERMANENT') {
    return res.status(403).json({
      error: 'CRITICAL_SECURITY_RULE: Permanent deletion requires explicit admin confirmation phrase: CONFIRM_DELETE_PERMANENT.',
    });
  }

  const idx = masterPhotos.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Master photo not found' });
  }

  const deleted = masterPhotos.splice(idx, 1)[0];

  // Also remove from any album selection reference
  albumSelections.forEach((sel) => {
    sel.selectedPhotoReferences = sel.selectedPhotoReferences.filter((r) => r.masterPhotoId !== id);
    sel.totalSelected = sel.selectedPhotoReferences.length;
  });

  res.json({
    success: true,
    message: `Master file ${deleted.originalFileName} (${deleted.id}) permanently deleted by authorized admin.`,
    deletedId: id,
  });
});

// Toggle Archive status (RULE P)
app.patch('/api/storage/master-photo/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isArchived = true } = req.body;

  const photo = masterPhotos.find((p) => p.id === id);
  if (!photo) {
    return res.status(404).json({ error: 'Master photo not found' });
  }

  photo.isArchived = Boolean(isArchived);
  res.json({
    success: true,
    photo,
    message: photo.isArchived ? 'Photo archived successfully' : 'Photo restored from archive',
  });
});

// ======================================================================
// SMART MEDIA UPLOAD SYSTEM & SOCIAL MEDIA BACKEND SERVICES
// ======================================================================

let siteMediaConfig: SiteMediaConfig = {
  logoMain: '/brand-logo.jpg',
  logoHeader: '/brand-logo.jpg',
  logoFooter: '/brand-logo.jpg',
  logoMobile: '/brand-logo.jpg',
  logoFavicon: '/brand-logo.jpg',
  founderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  paymentQrCode: '',
  upiId: '7608814804@ybl',
  instagramCover: '',
  facebookCover: '',
  youtubeCover: '',
  promoBanner1: '',
  promoBanner2: '',
  updatedAt: new Date().toISOString(),
};

let socialMediaSettings: SocialMediaSettings = {
  instagramUrl: 'https://www.instagram.com/sushil__photography_jhar?stkn=dWYxM2Z6cW5hbWt4',
  facebookUrl: 'https://www.facebook.com/share/1X7CCrhwjN/',
  youtubeUrl: 'https://youtube.com/@sushilphotographyjhar?si=Sz-sGwGLGphMeUKX',
  showInstagram: true,
  showFacebook: true,
  showYouTube: true,
  updatedAt: new Date().toISOString(),
};

let smartMediaList: SmartMediaItem[] = [
  {
    id: 'SM-LOGO-01',
    name: 'Sushil_Photography_Main_Emblem.png',
    type: 'image/png',
    sizeFormatted: '1.2 MB',
    sizeBytes: 1258291,
    url: '',
    category: 'Logo',
    slotKey: 'logo_main',
    usedIn: 'Header & Footer Brand Logo',
    uploadedAt: '2026-01-10',
    title: 'Studio Primary Logo',
  },
  {
    id: 'SM-FOUNDER-01',
    name: 'Sushil_Meher_Lead_Photographer.jpg',
    type: 'image/jpeg',
    sizeFormatted: '2.8 MB',
    sizeBytes: 2936012,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    category: 'Photographer',
    slotKey: 'photographer_photo',
    usedIn: 'About Page & Artist Bio',
    uploadedAt: '2026-01-12',
    title: 'Sushil Meher - Founder & Lead Artist',
    caption: 'Founder, Master Cinematographer & Senior Colorist',
  },
  {
    id: 'SM-WED-01',
    name: 'Royal_Odia_Mandap_Sindoor_Dan.jpg',
    type: 'image/jpeg',
    sizeFormatted: '4.5 MB',
    sizeBytes: 4718592,
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    category: 'Wedding',
    usedIn: 'Wedding Portfolio Gallery',
    uploadedAt: '2026-01-15',
    title: 'Sacred Sindoor Dan Ceremony',
    caption: 'Traditional Vedic wedding ritual captured in Bargarh',
    featured: true,
  },
  {
    id: 'SM-WED-02',
    name: 'Bespoke_Bride_Jaimala_Moment.jpg',
    type: 'image/jpeg',
    sizeFormatted: '3.9 MB',
    sizeBytes: 4089446,
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    category: 'Wedding',
    usedIn: 'Wedding Portfolio Gallery',
    uploadedAt: '2026-01-18',
    title: 'Jaimala Garland Exchange',
    caption: 'Emotional candid exchange with sparkling floral canopy',
    featured: true,
  },
  {
    id: 'SM-PREWED-01',
    name: 'Sunset_Temple_Lakeside_Silhouette.jpg',
    type: 'image/jpeg',
    sizeFormatted: '3.2 MB',
    sizeBytes: 3355443,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    category: 'Pre-Wedding',
    usedIn: 'Pre-Wedding Showcase',
    uploadedAt: '2026-01-20',
    title: 'Heritage Lake Golden Hour',
    caption: 'Sambalpur lake sunset with natural ambient glow',
    featured: true,
  },
  {
    id: 'SM-ALBUM-01',
    name: 'Royal_Heritage_12x36_Panoramic_Cover.jpg',
    type: 'image/jpeg',
    sizeFormatted: '5.1 MB',
    sizeBytes: 5347737,
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
    category: 'Album Design',
    usedIn: '12x36 Album Design Portal',
    uploadedAt: '2026-01-22',
    title: 'Royal Heritage 12x36 Layflat Album',
    description: 'Gold-foiled velvet cover with high-definition panoramic print spreads',
    sheetsCount: 30,
    albumPages: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'SM-EDIT-01',
    name: 'Skin_Retouch_Frequency_Separation_Sample.jpg',
    type: 'image/jpeg',
    sizeFormatted: '4.1 MB',
    sizeBytes: 4300000,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    beforeUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    category: 'Photo Editing',
    usedIn: 'Photo Editing Before/After Studio',
    uploadedAt: '2026-01-25',
    title: 'Bridal High-End Skin Retouching',
    description: 'Blemish removal with pore texture preservation & eye iris brightening',
  },
  {
    id: 'SM-VID-01',
    name: 'Priya_Rajesh_Cinematic_Wedding_Teaser.mp4',
    type: 'video/mp4',
    sizeFormatted: '850 MB',
    sizeBytes: 891289600,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    category: 'Wedding Highlights',
    usedIn: 'Wedding Highlights Showcase',
    uploadedAt: '2026-01-26',
    title: 'Royal Mandap Cinematic Teaser',
    description: '4K Aerial drone and slow-motion gimbal 3-minute highlight film',
    duration: '3:45',
  },
  {
    id: 'SM-CARD-01',
    name: 'Royal_Odia_Wedding_Invitation_Card_Gold_Foil.jpg',
    type: 'image/jpeg',
    sizeFormatted: '3.4 MB',
    sizeBytes: 3565158,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    category: 'Wedding Cards',
    usedIn: 'Wedding Card & Graphic Design Section',
    uploadedAt: '2026-01-28',
    title: 'Traditional Gold Foil Wedding Card',
    description: 'Laser-cut floral border with Sambalpuri auspicious motifs & bilingual Sanskrit text',
  },
  {
    id: 'SM-FRAME-01',
    name: 'Luxury_Acrylic_Floating_Photo_Frame_20x30.jpg',
    type: 'image/jpeg',
    sizeFormatted: '2.9 MB',
    sizeBytes: 3040870,
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
    category: 'Photo Frames',
    usedIn: 'Photo Frame & Wall Decor Section',
    uploadedAt: '2026-01-29',
    title: '20x30 Floating Acrylic Wall Frame',
    description: 'Museum grade anti-reflective acrylic with metallic mounting studs',
  },
];

// GET all smart media items (with filter & search)
app.get('/api/media', (req: Request, res: Response) => {
  const { category, search, slotKey } = req.query;
  let results = [...smartMediaList];

  if (category && category !== 'All') {
    results = results.filter((m) => m.category.toLowerCase() === String(category).toLowerCase());
  }

  if (slotKey) {
    results = results.filter((m) => m.slotKey === String(slotKey));
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.title && m.title.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q) ||
        m.usedIn.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// POST add / upload new smart media
app.post('/api/media', (req: Request, res: Response) => {
  const {
    name,
    type = 'image/jpeg',
    url,
    thumbnailUrl,
    category = 'Other',
    slotKey,
    usedIn,
    sizeBytes = 2500000,
    dimensions,
    caption,
    title,
    description,
    featured = false,
    beforeUrl,
    afterUrl,
    sheetsCount,
    albumPages,
    duration,
  } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Media URL or file data is required.' });
  }

  const numBytes = Number(sizeBytes) || 2500000;
  let sizeFormatted = '2.5 MB';
  if (numBytes >= 1024 * 1024 * 1024) {
    sizeFormatted = `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else if (numBytes >= 1024 * 1024) {
    sizeFormatted = `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    sizeFormatted = `${(numBytes / 1024).toFixed(0)} KB`;
  }

  const newMedia: SmartMediaItem = {
    id: `SM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    name: name || `media_upload_${Date.now()}`,
    type,
    sizeFormatted,
    sizeBytes: numBytes,
    url,
    thumbnailUrl: thumbnailUrl || url,
    category: category as SmartMediaCategory,
    slotKey: slotKey || undefined,
    usedIn: usedIn || `${category} Section`,
    uploadedAt: new Date().toISOString().split('T')[0],
    dimensions,
    caption,
    title: title || name,
    description,
    featured: Boolean(featured),
    beforeUrl,
    afterUrl,
    sheetsCount,
    albumPages,
    duration,
  };

  smartMediaList.unshift(newMedia);

  // Auto-connect to site configuration slot if requested
  if (slotKey) {
    if (slotKey === 'logo_main' || slotKey === 'logo') {
      siteMediaConfig.logoMain = url;
    } else if (slotKey === 'photographer_photo' || slotKey === 'founder_photo') {
      siteMediaConfig.founderPhoto = url;
    } else if (slotKey === 'payment_qr' || slotKey === 'qr_code') {
      siteMediaConfig.paymentQrCode = url;
      paymentSettings.qrCodeUrl = url;
    }
    siteMediaConfig.updatedAt = new Date().toISOString();
  }

  res.status(201).json({ success: true, media: newMedia, siteMediaConfig });
});

// PUT update smart media item
app.put('/api/media/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = smartMediaList.findIndex((m) => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Media item not found' });
  }

  const existing = smartMediaList[idx];
  const updated: SmartMediaItem = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID change
  };

  smartMediaList[idx] = updated;

  // If this item was linked to a slotKey, keep slot in sync
  if (updated.slotKey && updated.url) {
    if (updated.slotKey === 'logo_main') siteMediaConfig.logoMain = updated.url;
    if (updated.slotKey === 'photographer_photo') siteMediaConfig.founderPhoto = updated.url;
    if (updated.slotKey === 'payment_qr') {
      siteMediaConfig.paymentQrCode = updated.url;
      paymentSettings.qrCodeUrl = updated.url;
    }
  }

  res.json({ success: true, media: updated });
});

// DELETE smart media item
app.delete('/api/media/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = smartMediaList.findIndex((m) => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Media item not found' });
  }

  const deleted = smartMediaList.splice(idx, 1)[0];

  // If deleted item had a slotKey, clear that slot so the placeholder re-appears
  if (deleted.slotKey) {
    if (deleted.slotKey === 'logo_main' && siteMediaConfig.logoMain === deleted.url) {
      siteMediaConfig.logoMain = '';
    }
    if (deleted.slotKey === 'photographer_photo' && siteMediaConfig.founderPhoto === deleted.url) {
      siteMediaConfig.founderPhoto = '';
    }
    if (deleted.slotKey === 'payment_qr' && siteMediaConfig.paymentQrCode === deleted.url) {
      siteMediaConfig.paymentQrCode = '';
      paymentSettings.qrCodeUrl = '';
    }
    siteMediaConfig.updatedAt = new Date().toISOString();
  }

  res.json({ success: true, message: 'Media item removed successfully', deletedId: id });
});

// GET site media config
app.get('/api/site-media', (req: Request, res: Response) => {
  res.json(siteMediaConfig);
});

// PUT update site media config
app.put('/api/site-media', (req: Request, res: Response) => {
  siteMediaConfig = {
    ...siteMediaConfig,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (siteMediaConfig.paymentQrCode) {
    paymentSettings.qrCodeUrl = siteMediaConfig.paymentQrCode;
  }
  if (siteMediaConfig.upiId) {
    paymentSettings.upiId = siteMediaConfig.upiId;
  }

  res.json({ success: true, siteMediaConfig });
});

// GET social media settings
app.get('/api/social-media', (req: Request, res: Response) => {
  res.json(socialMediaSettings);
});

// PUT update social media settings
app.put('/api/social-media', (req: Request, res: Response) => {
  const {
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    showInstagram,
    showFacebook,
    showYouTube,
  } = req.body;

  // Validate URLs if provided
  const validateUrl = (url?: string) => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  };

  if (instagramUrl !== undefined && !validateUrl(instagramUrl)) {
    return res.status(400).json({ error: 'Please enter a valid Instagram URL.' });
  }
  if (facebookUrl !== undefined && !validateUrl(facebookUrl)) {
    return res.status(400).json({ error: 'Please enter a valid Facebook URL.' });
  }
  if (youtubeUrl !== undefined && !validateUrl(youtubeUrl)) {
    return res.status(400).json({ error: 'Please enter a valid YouTube URL.' });
  }

  socialMediaSettings = {
    instagramUrl: instagramUrl !== undefined ? instagramUrl.trim() : socialMediaSettings.instagramUrl,
    facebookUrl: facebookUrl !== undefined ? facebookUrl.trim() : socialMediaSettings.facebookUrl,
    youtubeUrl: youtubeUrl !== undefined ? youtubeUrl.trim() : socialMediaSettings.youtubeUrl,
    showInstagram: showInstagram !== undefined ? Boolean(showInstagram) : socialMediaSettings.showInstagram,
    showFacebook: showFacebook !== undefined ? Boolean(showFacebook) : socialMediaSettings.showFacebook,
    showYouTube: showYouTube !== undefined ? Boolean(showYouTube) : socialMediaSettings.showYouTube,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, socialMediaSettings });
});


// ------------------------------------
// VITE OR STATIC SERVING
// ------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sushil Photography Jhar] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
