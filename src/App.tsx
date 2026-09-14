import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { Lightbox } from './components/Lightbox';
import { InvoiceModal } from './components/InvoiceModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { WeddingPage } from './pages/WeddingPage';
import { PreWeddingPage } from './pages/PreWeddingPage';
import { AlbumDesignPage } from './pages/AlbumDesignPage';
import { PhotoEditingPage } from './pages/PhotoEditingPage';
import { GalleryPage } from './pages/GalleryPage';
import { PackagesPage } from './pages/PackagesPage';
import { UploadPhotosPage } from './pages/UploadPhotosPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { PaymentDetailsPage } from './pages/PaymentDetailsPage';
import { WeddingHighlightsSection } from './components/WeddingHighlightsSection';
import { PrivateWeddingGallery } from './components/PrivateWeddingGallery';

// Types & Services
import { ServiceItem, PackageItem, GalleryItem, ReviewItem, OrderItem } from './types';
import { api } from './services/api';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Application Data States
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Modals States
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<PackageItem | null>(null);

  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    amount: number;
    description?: string;
  } | null>(null);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [servicesRes, packagesRes, galleryRes, reviewsRes] = await Promise.all([
          api.getServices(),
          api.getPackages(),
          api.getGallery(),
          api.getReviews(),
        ]);
        setServices(servicesRes);
        setPackages(packagesRes);
        setGalleryItems(galleryRes);
        setReviews(reviewsRes);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load initial studio data:', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleBookingWithPackage = (pkg: PackageItem) => {
    setSelectedPackageForBooking(pkg);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingId: string) => {
    showToast(`Booking request submitted! Reference ID: ${bookingId}`);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    showToast(`Payment processed successfully! Transaction ID: ${paymentId}`);
  };

  const handleReviewAdded = (newReview: ReviewItem) => {
    setReviews((prev) => [newReview, ...prev]);
    showToast('Your review was successfully published!');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Top Banner Alert Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#121216] border border-[#d4af37] text-[#f5e7b2] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'booking') {
            setShowBookingModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenBooking={() => setShowBookingModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        isAdmin={isAdminLoggedIn}
        isCustomer={isCustomerLoggedIn}
        onLogoutAdmin={() => {
          setIsAdminLoggedIn(false);
          setCurrentTab('home');
          showToast('Logged out of Admin Dashboard.');
        }}
      />

      {/* Page Routing */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab) => {
              if (tab === 'booking') setShowBookingModal(true);
              else setCurrentTab(tab);
            }}
            onOpenBooking={() => setShowBookingModal(true)}
            packages={packages}
            services={services}
            galleryItems={galleryItems}
            reviews={reviews}
            onOpenLightbox={(item) => setLightboxItem(item)}
            onOpenBookingWithPackage={handleBookingWithPackage}
            onSelectPackage={handleBookingWithPackage}
            onSelectService={() => setCurrentTab('services')}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onNavigate={setCurrentTab}
            onOpenBooking={() => setShowBookingModal(true)}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            onNavigate={setCurrentTab}
            onOpenBooking={() => setShowBookingModal(true)}
          />
        )}

        {currentTab === 'wedding' && (
          <WeddingPage
            packages={packages}
            onNavigate={setCurrentTab}
            onOpenBookingWithPackage={handleBookingWithPackage}
            onOpenBooking={() => setShowBookingModal(true)}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentTab === 'pre-wedding' && (
          <PreWeddingPage
            onNavigate={setCurrentTab}
            onOpenBooking={() => setShowBookingModal(true)}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentTab === 'album-design' && (
          <AlbumDesignPage
            onNavigate={setCurrentTab}
            onOpenBooking={() => setShowBookingModal(true)}
          />
        )}

        {currentTab === 'photo-editing' && (
          <PhotoEditingPage
            onNavigate={setCurrentTab}
            onOpenBooking={() => setShowBookingModal(true)}
          />
        )}

        {currentTab === 'highlights' && (
          <div className="pt-24 pb-20 min-h-screen bg-[#09090b]">
            <WeddingHighlightsSection onBookWedding={() => setShowBookingModal(true)} />
          </div>
        )}

        {currentTab === 'private-vault' && (
          <div className="pt-24 pb-20 min-h-screen bg-[#09090b]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <PrivateWeddingGallery initialOrderId="SPJ-ORD-1001" />
            </div>
          </div>
        )}

        {currentTab === 'gallery' && (
          <GalleryPage
            galleryItems={galleryItems}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentTab === 'packages' && (
          <PackagesPage
            packages={packages}
            onOpenBookingWithPackage={handleBookingWithPackage}
            onOpenBooking={() => setShowBookingModal(true)}
          />
        )}

        {currentTab === 'upload-photos' && (
          <UploadPhotosPage
            onNavigate={setCurrentTab}
            onOpenPayment={(id, amt) => setPaymentData({ orderId: id, amount: amt })}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsPage
            reviews={reviews}
            onReviewAdded={handleReviewAdded}
          />
        )}

        {currentTab === 'contact' && <ContactPage />}

        {/* Dedicated Payment Details & UPI Section */}
        {(currentTab === 'payment' || currentTab === 'payment-details') && (
          <PaymentDetailsPage
            initialOrderId={paymentData?.orderId}
            initialAmount={paymentData?.amount}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'track-order' && (
          <OrderTrackingPage
            onOpenInvoice={(id) => setInvoiceOrderId(id)}
            onOpenPayment={(id, amt) => {
              setPaymentData({ orderId: id, amount: amt });
              setCurrentTab('payment');
            }}
          />
        )}

        {(currentTab === 'admin' || currentTab === 'admin-dashboard') && (
          <AdminDashboardPage
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setCurrentTab('home');
              showToast('Logged out of Admin Dashboard.');
            }}
            onOpenInvoice={(id) => setInvoiceOrderId(id)}
            onOpenPayment={(id, amt) => {
              setPaymentData({ orderId: id, amount: amt });
              setCurrentTab('payment');
            }}
          />
        )}

        {currentTab === 'customer-dashboard' && (
          <CustomerDashboardPage
            onLogout={() => {
              setIsCustomerLoggedIn(false);
              setCurrentTab('home');
              showToast('Logged out of Customer Dashboard.');
            }}
            onOpenInvoice={(id) => setInvoiceOrderId(id)}
            onOpenPayment={(id, amt) => setPaymentData({ orderId: id, amount: amt })}
            onNavigate={setCurrentTab}
          />
        )}
      </main>

      {/* Floating Action Bars for WhatsApp and Quick Phone Calls */}
      <FloatingActions onOpenBooking={() => setShowBookingModal(true)} />

      {/* Footer with Business Credentials, Schema & SEO */}
      <Footer onNavigate={setCurrentTab} />

      {/* Modals */}
      {/* 1. Booking Reservation Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedPackageForBooking(null);
        }}
        selectedPackage={selectedPackageForBooking}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* 2. Lightbox Fullscreen Media Viewer */}
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      )}

      {/* 3. Official Printable Tax Invoice Modal */}
      {invoiceOrderId && (
        <InvoiceModal
          orderId={invoiceOrderId}
          onClose={() => setInvoiceOrderId(null)}
        />
      )}

      {/* 4. Payment Gateway Simulation Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={true}
          orderId={paymentData.orderId}
          amount={paymentData.amount}
          description={paymentData.description}
          onClose={() => setPaymentData(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* 5. User & Admin Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAdminLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentTab('admin-dashboard');
          showToast('Welcome Sushil Meher! Admin Dashboard activated.');
        }}
        onCustomerLoginSuccess={() => {
          setIsCustomerLoggedIn(true);
          setCurrentTab('customer-dashboard');
          showToast('Welcome to your Client Portal!');
        }}
      />
    </div>
  );
}
