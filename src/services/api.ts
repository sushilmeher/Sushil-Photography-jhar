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

  // Payments
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
  ): Promise<{ success: boolean; paymentId: string; transactionId: string; payment: PaymentRecord }> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch('/api/payments');
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
};

