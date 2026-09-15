import {
  ServiceItem,
  PackageItem,
  ReviewItem,
  GalleryItem,
  Order,
  Booking,
  CustomerUpload,
  PaymentRecord,
  InvoiceData,
  AppNotification,
  WeddingVideoItem,
  StorageMetrics,
  StorageFileItem,
  PrivateCustomerGallery,
  WeddingFinalDelivery,
  MasterPhotoItem,
  AlbumSelectionRecord,
  UploadSessionRecord,
  PaymentSettings,
  PaymentReceiptData,
  SmartMediaItem,
  SiteMediaConfig,
  SocialMediaSettings,
  StudioPoliciesData,
  BankPaymentSubmission,
  PhotoEditingService,
  PhotoEditingOrderItem,
  PhotoEditingUploadFile,
} from '../types';


export const api = {
  // Services
  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async addService(service: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    return res.json();
  },

  async createService(service: Partial<ServiceItem>): Promise<ServiceItem> {
    return this.addService(service);
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Packages
  async getPackages(): Promise<PackageItem[]> {
    const res = await fetch('/api/packages');
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  async updatePackage(id: string, updates: Partial<PackageItem>): Promise<PackageItem> {
    const res = await fetch(`/api/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const res = await fetch('/api/bookings');
    return res.json();
  },

  async createBooking(
    bookingData: any
  ): Promise<{ success: boolean; booking: Booking; order: Order; bookingId: string; orderId: string }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  async updateBookingStatus(
    id: string,
    status: string,
    assignedPhotographer?: string
  ): Promise<Booking> {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedPhotographer }),
    });
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    return res.json();
  },

  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async trackOrder(orderId: string, phone: string): Promise<Order> {
    const params = new URLSearchParams();
    if (orderId) params.append('orderId', orderId);
    if (phone) params.append('phone', phone);
    const res = await fetch(`/api/orders/track?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Order tracking failed');
    }
    return res.json();
  },

  async getOrderByIdOrPhone(query: string): Promise<Order | null> {
    try {
      const isPhone = /^[0-9+ ]+$/.test(query.trim());
      const res = await this.trackOrder(
        isPhone ? '' : query.trim(),
        isPhone ? query.trim() : ''
      );
      return res;
    } catch {
      return null;
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.updateOrder(id, { orderStatus: status, status });
  },

  // Uploads
  async uploadPhotos(
    uploadData: any
  ): Promise<{ success: boolean; uploadId: string; orderId: string; upload: CustomerUpload }> {
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uploadData),
    });
    return res.json();
  },

  async getUploads(): Promise<CustomerUpload[]> {
    const res = await fetch('/api/uploads');
    return res.json();
  },

  // Reviews
  async getReviews(all: boolean = false): Promise<ReviewItem[]> {
    const res = await fetch(`/api/reviews?all=${all}`);
    return res.json();
  },

  async addReview(
    reviewData: Partial<ReviewItem>
  ): Promise<{ success: boolean; review: ReviewItem }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return res.json();
  },

  async createReview(reviewData: Partial<ReviewItem>): Promise<ReviewItem> {
    const res = await this.addReview(reviewData);
    return res.review;
  },

  async toggleReviewApproval(id: string): Promise<ReviewItem> {
    const res = await fetch(`/api/reviews/${id}/approve`, { method: 'PATCH' });
    return res.json();
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery');
    return res.json();
  },

  async addGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Payments & Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    const res = await fetch('/api/payment-settings');
    if (!res.ok) throw new Error('Failed to fetch payment settings');
    return res.json();
  },

  async updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<{ success: boolean; settings: PaymentSettings }> {
    const res = await fetch('/api/payment-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update payment settings');
    return res.json();
  },

  async createPaymentIntent(payload: any) {
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async verifyPayment(
    payload: any
  ): Promise<{
    success: boolean;
    paymentId: string;
    transactionId: string;
    receiptNumber: string;
    amount: number;
    date: string;
    status: string;
    payment: PaymentRecord;
    receipt: PaymentReceiptData;
    order: Order;
  }> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Payment verification failed' }));
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  },

  async submitBankTransfer(payload: any): Promise<{ success: boolean; payment: PaymentRecord; message?: string }> {
    const res = await fetch('/api/payments/bank-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Bank transfer submission failed' }));
      throw new Error(err.error || 'Bank transfer submission failed');
    }
    return res.json();
  },

  async getPayments(filters?: {
    search?: string;
    status?: string;
    method?: string;
    service?: string;
  }): Promise<PaymentRecord[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.service) params.append('service', filters.service);

    const url = `/api/payments${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async updatePaymentStatus(id: string, status: string, notes?: string): Promise<{ success: boolean; payment: PaymentRecord }> {
    const res = await fetch(`/api/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update payment status');
    return res.json();
  },

  async recordManualPayment(payload: any): Promise<{ success: boolean; payment: PaymentRecord }> {
    const res = await fetch('/api/payments/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record manual payment');
    return res.json();
  },

  async getPaymentReceipt(id: string): Promise<PaymentReceiptData> {
    const res = await fetch(`/api/payments/receipt/${id}`);
    if (!res.ok) throw new Error('Failed to fetch payment receipt');
    return res.json();
  },

  // Invoices & Notifications
  async getInvoices(): Promise<InvoiceData[]> {
    const res = await fetch('/api/invoices');
    return res.json();
  },

  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  // Contact
  async sendContact(message: any) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return res.json();
  },

  async sendMessage(message: any) {
    return this.sendContact(message);
  },

  // Admin
  async adminLogin(password: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Admin login failed');
    }
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // Founder Photo
  async getFounderPhoto(): Promise<{ photoUrl: string }> {
    const res = await fetch('/api/founder/photo');
    if (!res.ok) throw new Error('Failed to fetch founder photo');
    return res.json();
  },

  async updateFounderPhoto(photoData: string): Promise<{ success: boolean; photoUrl: string }> {
    const res = await fetch('/api/founder/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoData }),
    });
    if (!res.ok) throw new Error('Failed to update founder photo');
    return res.json();
  },

  // --------------------------------------------------
  // Wedding Videos & Highlights
  // --------------------------------------------------
  async getVideos(params?: {
    publicOnly?: boolean;
    isHighlight?: boolean;
    customerId?: string;
    orderId?: string;
  }): Promise<WeddingVideoItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.publicOnly) searchParams.append('publicOnly', 'true');
    if (params?.isHighlight) searchParams.append('isHighlight', 'true');
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.orderId) searchParams.append('orderId', params.orderId);

    const res = await fetch(`/api/videos?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async uploadVideo(videoData: Partial<WeddingVideoItem>): Promise<{
    success: boolean;
    video: WeddingVideoItem;
    storageRecord: StorageFileItem;
  }> {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData),
    });
    if (!res.ok) throw new Error('Failed to upload video');
    return res.json();
  },

  async updateVideo(id: string, updates: Partial<WeddingVideoItem>): Promise<{ success: boolean; video: WeddingVideoItem }> {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update video');
    return res.json();
  },

  async deleteVideo(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  },

  async getVideoSignedUrl(id: string): Promise<{
    videoId: string;
    title: string;
    signedStreamUrl: string;
    signedDownloadUrl: string;
    expiresAt: string;
  }> {
    const res = await fetch(`/api/videos/${id}/signed-url`);
    if (!res.ok) throw new Error('Failed to generate signed URL');
    return res.json();
  },

  // --------------------------------------------------
  // 5 TB Cloud Storage & Metrics
  // --------------------------------------------------
  async getStorageMetrics(): Promise<StorageMetrics> {
    const res = await fetch('/api/storage/metrics');
    if (!res.ok) throw new Error('Failed to fetch storage metrics');
    return res.json();
  },

  async expandStorage(additionalTB: number = 5): Promise<{
    success: boolean;
    additionalTB: number;
    metrics: StorageMetrics;
  }> {
    const res = await fetch('/api/storage/expand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additionalTB }),
    });
    if (!res.ok) throw new Error('Failed to expand storage');
    return res.json();
  },

  async getStorageFiles(params?: {
    category?: string;
    customerId?: string;
    orderId?: string;
    bookingId?: string;
    uploadId?: string;
  }): Promise<StorageFileItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.orderId) searchParams.append('orderId', params.orderId);
    if (params?.bookingId) searchParams.append('bookingId', params.bookingId);
    if (params?.uploadId) searchParams.append('uploadId', params.uploadId);

    const res = await fetch(`/api/storage/files?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch storage files');
    return res.json();
  },

  async uploadChunk(payload: {
    uploadId: string;
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    customerId?: string;
    customerName?: string;
    orderId?: string;
    bookingId?: string;
    category?: string;
  }): Promise<any> {
    const res = await fetch('/api/storage/upload-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Chunk upload failed');
    return res.json();
  },

  // --------------------------------------------------
  // Customer Private Gallery
  // --------------------------------------------------
  async getCustomerGallery(query?: string): Promise<PrivateCustomerGallery> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    const res = await fetch(`/api/customer/gallery?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load customer gallery');
    return res.json();
  },

  // --------------------------------------------------
  // Wedding Final Delivery
  // --------------------------------------------------
  async getFinalDelivery(orderId: string): Promise<WeddingFinalDelivery> {
    const res = await fetch(`/api/delivery/${orderId}`);
    if (!res.ok) throw new Error('Failed to load final delivery');
    return res.json();
  },

  async saveFinalDelivery(deliveryData: Partial<WeddingFinalDelivery>): Promise<{
    success: boolean;
    delivery: WeddingFinalDelivery;
  }> {
    const res = await fetch('/api/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveryData),
    });
    if (!res.ok) throw new Error('Failed to save final delivery');
    return res.json();
  },

  // --------------------------------------------------
  // Section 15: File Handling & Album Photo Selection
  // --------------------------------------------------
  async validateUploadFile(payload: {
    fileName: string;
    mimeType?: string;
    sizeBytes?: number;
  }): Promise<{
    valid: boolean;
    fileExtension?: string;
    sanitizedMime?: string;
    virusScanClean?: boolean;
    integrityCheck?: string;
    reason?: string;
    message?: string;
    allowedFormats?: string[];
  }> {
    const res = await fetch('/api/storage/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async checkDuplicate(payload: {
    fileHash?: string;
    fileName?: string;
    customerId?: string;
  }): Promise<{
    isDuplicate: boolean;
    duplicatePhoto?: MasterPhotoItem;
    message: string;
    fileId?: string;
    masterPhotoId?: string;
  }> {
    const res = await fetch('/api/storage/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAlbumSelection(orderId: string): Promise<{
    selection: AlbumSelectionRecord;
    masterPhotos: MasterPhotoItem[];
    selectedPhotos: (MasterPhotoItem & {
      sequenceOrder: number;
      isCoverPhoto: boolean;
      notes: string;
      designerProcessed: boolean;
      processedAt?: string;
    })[];
  }> {
    const res = await fetch(`/api/album-selection/${orderId}`);
    if (!res.ok) throw new Error('Failed to load album selection');
    return res.json();
  },

  async toggleAlbumPhoto(
    orderId: string,
    masterPhotoId: string
  ): Promise<{
    success: boolean;
    isSelected: boolean;
    totalSelected: number;
    selection: AlbumSelectionRecord;
  }> {
    const res = await fetch('/api/album-selection/toggle-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, masterPhotoId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle photo');
    }
    return res.json();
  },

  async reorderAlbumPhotos(
    orderId: string,
    photoIds: string[]
  ): Promise<{
    success: boolean;
    selectedPhotoReferences: any[];
  }> {
    const res = await fetch('/api/album-selection/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, photoIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder photos');
    return res.json();
  },

  async updateAlbumPhotoMeta(payload: {
    orderId: string;
    masterPhotoId: string;
    notes?: string;
    isCoverPhoto?: boolean;
  }): Promise<{
    success: boolean;
    ref: any;
    selection: AlbumSelectionRecord;
  }> {
    const res = await fetch('/api/album-selection/update-photo-meta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update photo details');
    return res.json();
  },

  async submitAlbumSelection(
    orderId: string,
    customerInstructions: string
  ): Promise<{
    success: boolean;
    message: string;
    selection: AlbumSelectionRecord;
  }> {
    const res = await fetch('/api/album-selection/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, customerInstructions }),
    });
    if (!res.ok) throw new Error('Failed to submit album selection');
    return res.json();
  },

  async getDesignerSelections(): Promise<(AlbumSelectionRecord & { photos: any[] })[]> {
    const res = await fetch('/api/designer/selections');
    if (!res.ok) throw new Error('Failed to load designer selections');
    return res.json();
  },

  async markDesignerPhotoProcessed(
    orderId: string,
    masterPhotoId: string,
    designerProcessed: boolean
  ): Promise<any> {
    const res = await fetch('/api/designer/mark-processed', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, masterPhotoId, designerProcessed }),
    });
    if (!res.ok) throw new Error('Failed to update designer status');
    return res.json();
  },

  async getUploadSessions(): Promise<UploadSessionRecord[]> {
    const res = await fetch('/api/storage/upload-sessions');
    if (!res.ok) throw new Error('Failed to load upload sessions');
    return res.json();
  },

  async createUploadSession(session: Partial<UploadSessionRecord>): Promise<UploadSessionRecord> {
    const res = await fetch('/api/storage/upload-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!res.ok) throw new Error('Failed to create upload session');
    return res.json();
  },

  async uploadMasterPhoto(photoData: Partial<MasterPhotoItem>): Promise<{
    success: boolean;
    photo: MasterPhotoItem;
    isDuplicate?: boolean;
    message: string;
  }> {
    const res = await fetch('/api/storage/upload-photo-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData),
    });
    return res.json();
  },

  async getMasterPhotos(params?: {
    customerId?: string;
    orderId?: string;
    search?: string;
    archived?: boolean;
  }): Promise<MasterPhotoItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.orderId) searchParams.append('orderId', params.orderId);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.archived !== undefined) searchParams.append('archived', String(params.archived));

    const res = await fetch(`/api/storage/master-photos?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load master photos');
    return res.json();
  },

  async deleteMasterPhotoPermanent(
    id: string,
    confirmationPhrase: string
  ): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`/api/storage/master-photo/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminConfirmed: true,
        confirmationPhrase,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Permanent deletion failed');
    }
    return res.json();
  },

  async toggleArchiveMasterPhoto(id: string, isArchived: boolean): Promise<any> {
    const res = await fetch(`/api/storage/master-photo/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived }),
    });
    if (!res.ok) throw new Error('Failed to toggle archive');
    return res.json();
  },

  // --------------------------------------------------
  // Smart Media Uploads & Site Media Config
  // --------------------------------------------------
  async getMedia(params?: { category?: string; search?: string; slotKey?: string }): Promise<SmartMediaItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.slotKey) searchParams.append('slotKey', params.slotKey);

    const res = await fetch(`/api/media?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  },

  async addMedia(item: Partial<SmartMediaItem>): Promise<{ success: boolean; media: SmartMediaItem; siteMediaConfig?: SiteMediaConfig }> {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload media');
    }
    return res.json();
  },

  async updateMedia(id: string, updates: Partial<SmartMediaItem>): Promise<{ success: boolean; media: SmartMediaItem }> {
    const res = await fetch(`/api/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update media');
    }
    return res.json();
  },

  async deleteMedia(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete media');
    }
    return res.json();
  },

  async getSiteMedia(): Promise<SiteMediaConfig> {
    const res = await fetch('/api/site-media');
    if (!res.ok) throw new Error('Failed to fetch site media configuration');
    return res.json();
  },

  async updateSiteMedia(config: Partial<SiteMediaConfig>): Promise<{ success: boolean; siteMediaConfig: SiteMediaConfig }> {
    const res = await fetch('/api/site-media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update site media configuration');
    }
    return res.json();
  },

  // --------------------------------------------------
  // Social Media Settings
  // --------------------------------------------------
  async getSocialMedia(): Promise<SocialMediaSettings> {
    const res = await fetch('/api/social-media');
    if (!res.ok) throw new Error('Failed to fetch social media settings');
    return res.json();
  },

  async updateSocialMedia(settings: Partial<SocialMediaSettings>): Promise<{ success: boolean; socialMediaSettings: SocialMediaSettings }> {
    const res = await fetch('/api/social-media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update social media settings');
    }
    return res.json();
  },

  // --------------------------------------------------
  // Bank Transfer Submissions & Verification
  // --------------------------------------------------
  async submitBankPayment(submission: BankPaymentSubmission): Promise<{
    success: boolean;
    submission: BankPaymentSubmission;
    receipt?: PaymentReceiptData;
  }> {
    const res = await fetch('/api/payments/bank-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Bank transfer submission failed' }));
      throw new Error(err.error || 'Failed to submit bank transfer');
    }
    return res.json();
  },

  // --------------------------------------------------
  // Policies & Legal Settings
  // --------------------------------------------------
  async getPolicies(): Promise<StudioPoliciesData> {
    const res = await fetch('/api/policies');
    if (!res.ok) throw new Error('Failed to fetch studio policies');
    return res.json();
  },

  async updatePolicies(data: StudioPoliciesData): Promise<{ success: boolean; policies: StudioPoliciesData }> {
    const res = await fetch('/api/policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update studio policies');
    }
    return res.json();
  },

  // --------------------------------------------------
  // Photo Editing Services & Orders APIs
  // --------------------------------------------------
  async getPhotoEditingServices(all = false): Promise<PhotoEditingService[]> {
    const res = await fetch(`/api/photo-editing/services${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch photo editing services');
    return res.json();
  },

  async addPhotoEditingService(service: Partial<PhotoEditingService>): Promise<{ success: boolean; service: PhotoEditingService }> {
    const res = await fetch('/api/photo-editing/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add service' }));
      throw new Error(err.error || 'Failed to add service');
    }
    return res.json();
  },

  async updatePhotoEditingService(id: string, updates: Partial<PhotoEditingService>): Promise<{ success: boolean; service: PhotoEditingService }> {
    const res = await fetch(`/api/photo-editing/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update service' }));
      throw new Error(err.error || 'Failed to update service');
    }
    return res.json();
  },

  async deletePhotoEditingService(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`/api/photo-editing/services/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete service' }));
      throw new Error(err.error || 'Failed to delete service');
    }
    return res.json();
  },

  async getPhotoEditingOrders(params?: { search?: string; paymentStatus?: string; orderStatus?: string }): Promise<PhotoEditingOrderItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
    if (params?.orderStatus) query.set('orderStatus', params.orderStatus);

    const res = await fetch(`/api/photo-editing/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch photo editing orders');
    return res.json();
  },

  async trackPhotoEditingOrder(query: { orderId?: string; phone?: string; email?: string }): Promise<PhotoEditingOrderItem> {
    const params = new URLSearchParams();
    if (query.orderId) params.set('orderId', query.orderId);
    if (query.phone) params.set('phone', query.phone);
    if (query.email) params.set('email', query.email);

    const res = await fetch(`/api/photo-editing/orders/track?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Tracking failed' }));
      throw new Error(err.error || 'No matching order found');
    }
    return res.json();
  },

  async getPhotoEditingOrder(id: string): Promise<PhotoEditingOrderItem> {
    const res = await fetch(`/api/photo-editing/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async uploadPhotoEditingFiles(files: any[], orderId?: string): Promise<{
    success: boolean;
    orderId: string;
    totalFiles: number;
    files: PhotoEditingUploadFile[];
  }> {
    const res = await fetch('/api/photo-editing/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, orderId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload processing failed' }));
      throw new Error(err.error || 'Failed to process uploads');
    }
    return res.json();
  },

  async submitPhotoEditingOrder(orderData: any): Promise<{
    success: boolean;
    orderId: string;
    order: PhotoEditingOrderItem;
    payment: PaymentRecord;
  }> {
    const res = await fetch('/api/photo-editing/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit order' }));
      throw new Error(err.error || 'Order submission failed');
    }
    return res.json();
  },

  async updatePhotoEditingOrder(id: string, updates: any): Promise<{ success: boolean; order: PhotoEditingOrderItem }> {
    const res = await fetch(`/api/photo-editing/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update order' }));
      throw new Error(err.error || 'Failed to update order');
    }
    return res.json();
  },

  async uploadPhotoEditingAdminFiles(
    id: string,
    targetFolder: 'edited' | 'final',
    files: any[]
  ): Promise<{ success: boolean; order: PhotoEditingOrderItem; uploaded: any[] }> {
    const res = await fetch(`/api/photo-editing/orders/${id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFolder, files }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'File upload failed' }));
      throw new Error(err.error || 'Failed to upload files');
    }
    return res.json();
  },

  async deletePhotoEditingOrderFile(id: string, fileId: string): Promise<{ success: boolean; order: PhotoEditingOrderItem }> {
    const res = await fetch(`/api/photo-editing/orders/${id}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'File deletion failed' }));
      throw new Error(err.error || 'Failed to delete file');
    }
    return res.json();
  },

  async verifyPhotoEditingPayment(verificationData: any): Promise<{
    success: boolean;
    verified: boolean;
    transactionId: string;
    receiptNumber: string;
    amount: number;
    timestamp: string;
    message: string;
  }> {
    const res = await fetch('/api/photo-editing/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Payment verification failed' }));
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  },
};


