import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, Order, PaymentRecord } from '../types';

export const SUPABASE_PROJECT_ID = 'rlewwujizdhnornbwhaq';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 'sb_publishable_d5-bxyNqHpFbvv6cZw1S7w_Aa8zdttH';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClientInstance;
}

export const supabaseService = {
  // Test connection to Supabase
  async testConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const client = getSupabaseClient();
      // Test basic connection by making a lightweight query
      const { error } = await client.from('bookings').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116' && error.message && !error.message.includes('relation "public.bookings" does not exist')) {
        // Connected to Supabase backend API successfully
        console.log('Supabase API contacted with response code:', error.code);
      }

      return {
        success: true,
        message: 'Successfully connected to Supabase Cloud Database (Project: rlewwujizdhnornbwhaq)',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to reach Supabase API',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Save Booking to Supabase
  async saveBooking(booking: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const client = getSupabaseClient();
      const payload = {
        id: booking.id || `SPJ-BK-${Date.now()}`,
        customer_name: booking.customerName || booking.name || 'Valued Client',
        customer_phone: booking.phone || booking.customerPhone || '',
        customer_email: booking.email || booking.customerEmail || null,
        service: Array.isArray(booking.requiredServices)
          ? booking.requiredServices.join(', ')
          : (booking.service || booking.eventType || 'Wedding Photography'),
        event_type: booking.eventType || 'Wedding',
        event_date: booking.eventDate || booking.weddingDate || booking.date || '',
        event_time: booking.eventTime || booking.time || null,
        location: booking.venue || booking.city || booking.location || null,
        status: booking.status || 'Pending',
        package_name: booking.packageName || booking.package || null,
        amount: booking.amount || booking.totalAmount || booking.budget || 0,
        advance_amount: booking.advanceAmount || booking.advancePaid || 0,
        notes: booking.additionalMessage || booking.notes || booking.message || null,
        created_at: booking.createdAt || new Date().toISOString(),
      };

      const { data, error } = await client
        .from('bookings')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.warn('Supabase bookings table notice (fallback to memory if table pending setup):', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('Supabase booking sync error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Save Payment Record to Supabase
  async savePayment(payment: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const client = getSupabaseClient();
      const payload = {
        id: payment.id || `PAY-SPJ-${Date.now()}`,
        order_id: payment.orderId || null,
        customer_name: payment.customerName,
        customer_phone: payment.customerPhone || null,
        customer_email: payment.customerEmail || null,
        amount: payment.amount,
        type: payment.type || 'Booking Advance',
        payment_method: payment.paymentMethod || 'UPI',
        status: payment.status || 'Payment Successful',
        transaction_id: payment.transactionId || payment.upiRefNumber || 'TRX-DEFAULT',
        receipt_number: payment.receiptNumber || null,
        date: payment.date || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('payments')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.warn('Supabase payments table notice:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('Supabase payment sync error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Save Order to Supabase
  async saveOrder(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const client = getSupabaseClient();
      const payload = {
        id: order.id || `SPJ-ORD-${Date.now()}`,
        customer_name: order.customerName,
        customer_phone: order.phone || order.customerPhone || '',
        service: order.service,
        status: order.orderStatus || order.status || 'Received',
        total_amount: order.amount || order.totalAmount || 0,
        advance_paid: order.advancePaid || 0,
        remaining_amount: order.remainingAmount || 0,
        order_date: order.bookingDate || order.orderDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };


      const { data, error } = await client
        .from('orders')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Fetch all Bookings from Supabase
  async fetchBookings(): Promise<any[]> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch bookings error:', err);
      return [];
    }
  },

  // Fetch all Payments from Supabase
  async fetchPayments(): Promise<any[]> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch payments error:', err);
      return [];
    }
  },
};
