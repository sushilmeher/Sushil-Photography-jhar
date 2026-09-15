export type OrderStatus =
  | 'Order Placed'
  | 'Booking Received'
  | 'Payment Pending'
  | 'Payment Confirmed'
  | 'Photo Selection'
  | 'Photos Received'
  | 'Editing'
  | 'Editing Started'
  | 'Editing Completed'
  | 'Album Designing'
  | 'Preview Ready'
  | 'Customer Approval'
  | 'Printing'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Completed';

export const ORDER_STATUSES: OrderStatus[] = [
  'Order Placed',
  'Booking Received',
  'Payment Pending',
  'Payment Confirmed',
  'Photo Selection',
  'Photos Received',
  'Editing',
  'Editing Started',
  'Editing Completed',
  'Album Designing',
  'Preview Ready',
  'Customer Approval',
  'Printing',
  'Ready for Delivery',
  'Delivered',
  'Completed',
];

export interface ServiceItem {
  id: string;
  title: string;
  category: 'photography' | 'cinematography' | 'editing' | 'albums' | 'design' | 'printing' | string;
  shortDescription: string;
  fullDescription: string;
  startingPrice: number;
  image: string;
  features: string[];
}

export interface PackageItem {
  id: string;
  name: string;
  price: number;
  subtitle: string;
  popular?: boolean;
  photographers: string;
  cinematographers?: string;
  videoCoverage: string;
  album: string;
  editing: string;
  highlightVideo: string;
  deliveryDetails: string;
  deliveryFormat?: string;
  deliveryTime?: string;
  advanceRequired?: number;
  droneIncluded?: boolean;
  rawPhotosIncluded?: boolean;
  description?: string;
  includedServices: string[];
}

export interface Booking {
  id: string;
  bookingId?: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  weddingDate: string;
  eventDate?: string;
  venue: string;
  city: string;
  eventType?: string;
  guestCount?: string;
  packageChosen?: string;
  requiredServices: string[];
  budget: string;
  assignedPhotographer?: string;
  additionalMessage?: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Completed' | 'pending' | 'confirmed' | 'rejected' | 'completed' | string;
  createdAt?: string;
  assignedOrderNumber?: string;
}

export type BookingItem = Booking;

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  category: string;
  url: string;
  uploadedAt: string;
}

export interface Order {
  id: string;
  bookingId?: string;
  customerName: string;
  customerPhone?: string;
  phone?: string;
  email?: string;
  serviceType?: string;
  service?: string;
  packageName?: string;
  package?: string;
  totalAmount?: number;
  amount?: number;
  advancePaid: number;
  balanceAmount?: number;
  remainingAmount?: number;
  paymentStatus: 'Pending' | 'Advance Paid' | 'Paid Full' | 'Refunded' | string;
  status?: OrderStatus | string;
  orderStatus?: OrderStatus | string;
  progressPercent?: number;
  estimatedDelivery?: string;
  notes?: string;
  files?: UploadedFile[];
  bookingDate?: string;
  eventDate?: string;
  uploadStatus?: 'No Upload' | 'Photos Uploaded' | 'Verified' | string;
  editingStatus?: 'Not Started' | 'In Progress' | 'Completed' | string;
  deliveryStatus?: 'Processing' | 'Ready' | 'Delivered' | string;
  uploadedFilesCount?: number;
  deliveredFilesLink?: string;
  createdAt?: string;
  statusHistory?: {
    status: OrderStatus | string;
    timestamp: string;
    note?: string;
  }[];
}

export type OrderItem = Order;

export interface AlbumTemplate {
  id: string;
  title: string;
  dimensions?: string;
  size?: string;
  sheets?: number;
  coverType?: string;
  paperType?: string;
  boxType?: string;
  price?: number;
  pricePerSheet?: number;
  image: string;
  description?: string;
  features?: string[];
}

export interface CustomerUpload {
  id: string;
  orderId?: string;
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
  files: {
    name: string;
    size: number | string;
    type?: string;
    url?: string;
  }[];
  totalFiles: number;
  uploadDate: string;
  status: 'Received' | 'In Review' | 'Processing' | 'Completed';
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  type: 'Booking Advance' | 'Full Payment' | 'Package Payment' | 'Album Payment' | 'Editing Payment' | 'Custom Order' | string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallets' | 'Cash / Offline' | string;
  status: 'Payment Successful' | 'Payment Pending' | 'Payment Processing' | 'Payment Failed' | 'Payment Refunded' | 'Partially Paid' | 'Fully Paid' | 'Success' | 'Pending' | 'Failed' | string;
  transactionId: string;
  date: string;
  service?: string;
  customerPhone?: string;
  customerEmail?: string;
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  receiptNumber?: string;
  notes?: string;
  upiRefNumber?: string;
}

export interface PaymentSettings {
  businessName: string;
  ownerName: string;
  paymentPhone: string;
  secondaryPhone: string;
  upiId: string;
  qrCodeUrl: string;
  paymentGateway: string;
  gatewayTestMode: boolean;
  razorpayKeyId: string;
  gatewaySecret?: string;
  webhookSecret?: string;
  bankInstructions: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    confirmAccountNumber?: string;
    ifscCode: string;
    branch: string;
    branchAddress?: string;
    accountType?: 'SAVINGS' | 'CURRENT' | string;
  };
  paymentTerms: string;
  refundPolicy: string;
  updatedAt?: string;
}

export interface BankPaymentSubmission {
  id?: string;
  orderId?: string;
  bookingId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  service: string;
  amount: number;
  transactionId: string; // UTR or Ref number
  paymentDate: string;
  screenshotUrl?: string;
  notes?: string;
  status: 'Pending Verification' | 'Payment Successful' | 'Rejected';
  submittedAt?: string;
}

export interface PaymentReceiptData {
  receiptNumber: string;
  paymentId: string;
  orderId: string;
  businessName: string;
  ownerName: string;
  paymentPhone: string;
  secondaryPhone: string;
  studioAddress: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  service: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId: string;
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  notes?: string;
}

export const PAYMENT_SERVICES_LIST = [
  'Wedding Booking',
  'Wedding Photography',
  'Wedding Cinematography',
  'Pre-Wedding',
  'Album Design',
  'Photo Editing',
  'Wedding Highlights',
  'Video Editing',
  'Photo Frames',
  'Wedding Cards',
  'Custom Orders',
] as const;

export type PaymentServiceType = typeof PAYMENT_SERVICES_LIST[number];

export interface ReviewItem {
  id: string;
  customerName: string;
  serviceUsed: string;
  rating: number; // 1 - 5
  review: string;
  photo?: string;
  date: string;
  isVerified: boolean;
  isApproved?: boolean;
  orderId?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  videoUrl?: string;
  location?: string;
  description?: string;
  featured?: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  orderId: string;
  service: string;
  packageName?: string;
  price: number;
  advance: number;
  remainingAmount: number;
  paymentStatus: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'order' | 'upload' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

// ----------------------------------------------------
// Wedding Video & Highlights Types
// ----------------------------------------------------
export type VideoCategory = 'highlight' | 'full_wedding_film' | 'teaser' | 'raw_footage' | 'drone_aerial' | 'sangeet' | 'reels';
export type VideoVisibility = 'Public Portfolio' | 'Customer Only' | 'Private';
export type SupportedVideoFormat = 'MP4' | 'MOV' | 'M4V' | 'WEBM';

export interface WeddingVideoItem {
  id: string;
  title: string;
  category: VideoCategory;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderId?: string;
  bookingId?: string;
  weddingDate?: string;
  eventDate?: string;
  description: string;
  duration: string; // e.g. "4:45", "1:18:30"
  resolution?: string; // "4K Ultra HD", "1080p Full HD"
  format: SupportedVideoFormat;
  sizeBytes: number;
  sizeFormatted: string; // e.g. "1.45 GB"
  thumbnailUrl: string;
  streamUrl: string;
  downloadUrl: string;
  visibility: VideoVisibility;
  uploadedAt: string;
  uploadId: string;
  storagePath: string; // Organized cloud path
  isHighlight?: boolean;
  featured?: boolean;
}

// ----------------------------------------------------
// 5 TB Cloud / Object Storage Types
// ----------------------------------------------------
export type StorageCategory =
  | 'Customers'
  | 'Weddings'
  | 'Photos'
  | 'Videos'
  | 'Highlights'
  | 'Editing'
  | 'Album'
  | 'Final Delivery'
  | 'Backups';

export interface StorageFileItem {
  id: string;
  uploadId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  bookingId: string;
  category: StorageCategory;
  fileName: string;
  fileType: string; // e.g. "video/mp4", "image/jpeg", "application/pdf"
  sizeBytes: number;
  sizeFormatted: string;
  storagePath: string;
  signedUrl: string;
  downloadToken: string;
  tokenExpiresAt: string;
  uploadedAt: string;
  isDelivered?: boolean;
}

export interface StorageMetrics {
  totalCapacityBytes: number; // 5 TB = 5,497,558,138,880 bytes (or 5,000 GB)
  totalCapacityFormatted: string;
  usedBytes: number;
  usedFormatted: string;
  availableBytes: number;
  availableFormatted: string;
  usedPercentage: number;
  breakdown: {
    photosBytes: number;
    photosFormatted: string;
    videosBytes: number;
    videosFormatted: string;
    highlightsBytes: number;
    highlightsFormatted: string;
    albumFilesBytes: number;
    albumFilesFormatted: string;
    editingRawBytes: number;
    editingRawFormatted: string;
    finalDeliveryBytes: number;
    finalDeliveryFormatted: string;
    backupsBytes: number;
    backupsFormatted: string;
  };
  totalFilesCount: number;
  totalVideosCount: number;
  totalPhotosCount: number;
  lastUpdated: string;
}

// ----------------------------------------------------
// Wedding Final Delivery Package
// ----------------------------------------------------
export interface WeddingFinalDelivery {
  id: string;
  orderId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  weddingDate: string;
  deliveryDate: string;
  status: 'Draft' | 'Delivered & Notified' | 'Approved';
  weddingHighlight?: {
    title: string;
    streamUrl: string;
    downloadUrl: string;
    thumbnailUrl: string;
    sizeFormatted: string;
    duration: string;
  };
  fullWeddingFilm?: {
    title: string;
    streamUrl: string;
    downloadUrl: string;
    sizeFormatted: string;
    duration: string;
  };
  editedPhotos?: {
    count: number;
    downloadZipUrl: string;
    sizeFormatted: string;
    samplePhotos: string[];
  };
  albumPreview?: {
    title: string;
    sheetsCount: number;
    previewSheets: string[];
    pdfDownloadUrl: string;
    sizeFormatted: string;
  };
  finalAlbumFiles?: {
    title: string;
    downloadUrl: string;
    sizeFormatted: string;
  };
  notificationMessage?: string;
  notificationSentAt?: string;
}

export interface PrivateCustomerGallery {
  customer: {
    id: string;
    name: string;
    phone: string;
    orderId: string;
    bookingId: string;
    weddingDate: string;
    venue: string;
  };
  photos: {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    category: string;
    size: string;
  }[];
  videos: WeddingVideoItem[];
  highlights: WeddingVideoItem[];
  editedPhotos: {
    id: string;
    title: string;
    url: string;
    size: string;
  }[];
  albumPreview: {
    title: string;
    coverUrl: string;
    sheets: string[];
    pdfUrl: string;
    sheetsCount: number;
  };
  finalDelivery?: WeddingFinalDelivery;
}

// --------------------------------------------------
// Section 15: Upload & File-Handling Rules Types
// --------------------------------------------------
export type SupportedPhotoMimeType =
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/webp'
  | 'image/heic'
  | 'image/heif';

export interface MasterPhotoItem {
  id: string; // Internal unique ID e.g. SPJ-IMG-2026-001
  fileId: string;
  originalFileName: string;
  fileHash: string; // SHA-256 checksum for duplicate prevention
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  customerId: string;
  customerName?: string;
  weddingId: string;
  orderId: string;
  bookingId?: string;
  albumSelectionId?: string;
  uploadId: string;
  sessionId?: string;
  
  // Three distinct tiers preserving master
  originalUrl: string; // Master uncompressed photo
  previewUrl: string; // Web-optimized preview
  thumbnailUrl: string; // Compact thumbnail
  
  // Selection reference without duplicating files
  selectedForAlbum: boolean;
  albumSequenceIndex?: number;
  customerNote?: string;
  isCoverCandidate?: boolean;
  
  uploadedAt: string;
  validationStatus: 'verified' | 'suspicious' | 'corrupted';
  virusScanClean: boolean;
  isArchived?: boolean;
  isDuplicate?: boolean;
  duplicateOfId?: string;
}

export interface AlbumSelectedPhotoRef {
  masterPhotoId: string;
  sequenceOrder: number;
  isCoverPhoto?: boolean;
  notes?: string;
  designerProcessed?: boolean;
  processedAt?: string;
}

export interface AlbumSelectionRecord {
  id: string; // Album Selection ID e.g. SEL-2026-001
  orderId: string;
  weddingId: string;
  customerId: string;
  customerName: string;
  status: 'draft' | 'submitted' | 'in_design' | 'completed';
  totalSelected: number;
  maxAllowed: number;
  targetSheetCount: number;
  customerInstructions: string;
  selectedPhotoReferences: AlbumSelectedPhotoRef[];
  submittedAt?: string;
  updatedAt: string;
  assignedDesigner?: string;
}

export interface UploadSessionFileRecord {
  fileId: string;
  originalName: string;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  status: 'completed' | 'uploading' | 'failed' | 'paused' | 'duplicate';
  progress: number;
  errorMessage?: string;
  hash?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  storagePath?: string;
}

export interface UploadSessionRecord {
  sessionId: string; // UP-2026-00025
  uploadId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  weddingId: string;
  totalFiles: number;
  uploadedFiles: number;
  failedFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  status: 'pending' | 'uploading' | 'completed' | 'paused' | 'failed';
  progressPercent: number;
  uploadDate: string;
  files: UploadSessionFileRecord[];
}

// --------------------------------------------------
// Smart Media Upload System & Placeholders
// --------------------------------------------------
export type SmartMediaCategory =
  | 'Logo'
  | 'Photographer'
  | 'Wedding'
  | 'Pre-Wedding'
  | 'Album Design'
  | 'Photo Editing'
  | 'Wedding Highlights'
  | 'Wedding Cards'
  | 'Photo Frames'
  | 'Payment QR'
  | 'Promotional'
  | 'Business'
  | 'Other';

export interface SmartMediaItem {
  id: string;
  name: string;
  type: string; // "image/png" | "image/jpeg" | "video/mp4" | "application/pdf"
  sizeFormatted: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  category: SmartMediaCategory;
  slotKey?: string; // e.g. "logo_main", "photographer_photo", "payment_qr", "promo_banner_1"
  usedIn: string; // e.g. "Header & Footer Logo", "Photographer Profile", "Wedding Portfolio"
  uploadedAt: string;
  dimensions?: string;
  caption?: string;
  featured?: boolean;
  reorderIndex?: number;
  title?: string;
  description?: string;
  
  // Specific category extensions
  beforeUrl?: string;
  afterUrl?: string;
  albumPages?: string[];
  sheetsCount?: number;
  duration?: string;
  fileFormat?: string;
}

export interface SiteMediaConfig {
  logoMain?: string;
  logoHeader?: string;
  logoFooter?: string;
  logoMobile?: string;
  logoFavicon?: string;
  founderPhoto?: string;
  paymentQrCode?: string;
  upiId?: string;
  instagramCover?: string;
  facebookCover?: string;
  youtubeCover?: string;
  promoBanner1?: string;
  promoBanner2?: string;
  updatedAt?: string;
}

export interface SocialMediaSettings {
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  showInstagram: boolean;
  showFacebook: boolean;
  showYouTube: boolean;
  whatsappNumber?: string;
  showWhatsApp?: boolean;
  phoneNumber?: string;
  showPhone?: boolean;
  updatedAt?: string;
}

export interface PolicySection {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'terms' | 'privacy' | 'refund' | 'payment' | 'usage' | 'upload' | 'security' | 'gallery' | 'ip' | 'thirdparty' | 'forcemajeure' | 'responsibilities';
  order: number;
  isPublished: boolean;
  lastModified?: string;
}

export interface StudioPoliciesData {
  businessName: string;
  ownerName: string;
  location: string;
  email: string;
  phoneNumbers: string[];
  lastUpdated: string;
  sections: PolicySection[];
}

export interface SupabaseConfig {
  projectId: string;
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime?: string;
  tables: {
    bookings: string;
    payments: string;
    orders: string;
    contactMessages: string;
  };
}


export interface WeddingCardSample {
  id: string;
  title: string;
  style: string;
  imageUrl: string;
  pdfUrl?: string;
  description: string;
  priceEstimate?: string;
}

export interface PhotoFrameSample {
  id: string;
  title: string;
  size: string;
  finish: string;
  imageUrl: string;
  description: string;
  priceEstimate?: string;
}

