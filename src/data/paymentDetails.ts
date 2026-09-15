import { PaymentSettings } from '../types';

export const OFFICIAL_PAYMENT_DETAILS: PaymentSettings = {
  businessName: 'Sushil Photography Jhar',
  ownerName: 'Sushil Meher',
  paymentPhone: '7608814804',
  secondaryPhone: '7735045136',
  upiId: '7608814804@hdfc',
  qrCodeUrl: '/assets/sushil-hdfc-upi-qr.png',
  paymentGateway: 'Razorpay',
  gatewayTestMode: true,
  razorpayKeyId: 'rzp_test_placeholder',
  bankInstructions: {
    bankName: 'HDFC BANK LTD.',
    accountHolder: 'SUSHIL MEHER',
    accountNumber: '50100802080920',
    confirmAccountNumber: '50100802080920',
    ifscCode: 'HDFC0001817',
    branch: 'BARGARH',
    branchAddress: 'HDFC BANK LTD. NEAR GURUDWAEA,NH-6',
    accountType: 'SAVINGS',
  },
  paymentTerms: `• Advance Payment: A 30% to 50% advance booking deposit is required to confirm and lock wedding dates on our studio calendar.
• Remaining Balance: Due on or before the final album dispatch, photo frame handover, or 4K video delivery.
• Verification: For direct Bank Transfer or UPI, submit the 12-digit UTR/Transaction ID for instant verification.
• Official Invoicing: GST/Studio invoices and official receipts are issued for all payments.`,
  refundPolicy: `• Date Transfer: Advance deposits can be transferred to an alternate available date with 15 days prior written notice.
• Cancellation: Due to exclusive date reservations and crew blocking, advance payments for cancellations within 7 days of event are non-refundable.
• Studio Guarantee: In the extraordinary event of studio equipment or personnel failure, 100% full refund is processed within 3-5 business days.`,
  updatedAt: new Date().toISOString(),
};
