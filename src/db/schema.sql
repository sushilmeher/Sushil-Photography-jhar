-- ==============================================================================
-- Sushil Photography Jhar (SPJ) - PostgreSQL / Supabase Database Schema
-- Project: rlewwujizdhnornbwhaq
-- Database: PostgreSQL 15+ (Supabase Cloud Database)
-- Generated for Sushil Photography Studio Management & Booking System
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: Bookings & Photography Appointments ('bookings')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service TEXT NOT NULL,
    event_type TEXT DEFAULT 'Wedding',
    event_date DATE NOT NULL,
    event_time TEXT,
    location TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled')),
    package_name TEXT,
    amount NUMERIC(10, 2) DEFAULT 0.00,
    advance_amount NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ==============================================================================
-- TABLE 2: Payments & Bank Transfers ('payments')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT DEFAULT 'Advance Payment',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'Successful', 'Failed', 'Refunded', 'Partial')),
    transaction_id TEXT,
    receipt_number TEXT,
    date DATE DEFAULT CURRENT_DATE,
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Payments
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date);

-- ==============================================================================
-- TABLE 3: Orders & Deliverables ('orders')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT DEFAULT 'Received' CHECK (status IN ('Received', 'In Progress', 'Editing', 'Album Design', 'Ready for Delivery', 'Completed', 'Cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ==============================================================================
-- TABLE 4: Studio Media & Hero Assets ('site_media')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_media (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    slot_key TEXT,
    title TEXT,
    description TEXT,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT DEFAULT 'image/jpeg',
    file_size_bytes BIGINT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 5: Studio Policies & Legal Settings ('policies')
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.policies (
    id TEXT PRIMARY KEY DEFAULT 'current_policies',
    studio_name TEXT DEFAULT 'Sushil Photography Jhar',
    phone TEXT DEFAULT '7608814804',
    secondary_phone TEXT DEFAULT '7735045136',
    email TEXT DEFAULT 'sushilmeher947@gmail.com',
    booking_terms TEXT,
    advance_policy TEXT,
    cancellation_policy TEXT,
    delivery_policy TEXT,
    copyright_policy TEXT,
    privacy_policy TEXT,
    disclaimer TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anon Insert & Select for Studio Front-end
CREATE POLICY "Allow public select bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Allow public select payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update payments" ON public.payments FOR UPDATE USING (true);

CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public select site_media" ON public.site_media FOR SELECT USING (true);
CREATE POLICY "Allow public insert site_media" ON public.site_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update site_media" ON public.site_media FOR UPDATE USING (true);

CREATE POLICY "Allow public select policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Allow public update policies" ON public.policies FOR UPDATE USING (true);
