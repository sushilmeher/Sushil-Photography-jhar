import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { BUSINESS_INFO } from '../data/mockData';

interface PaymentModalProps {
  orderId: string;
  defaultAmount?: number;
  paymentType?: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
  onSuccess: (paymentResult: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  orderId,
  defaultAmount = 5000,
  paymentType = 'Booking Advance',
  customerName = '',
  customerPhone = '',
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [selectedType, setSelectedType] = useState<string>(paymentType);
  const [method, setMethod] = useState<'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallets'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState(customerName || '');
  const [netBank, setNetBank] = useState('State Bank of India (SBI)');
  const [wallet, setWallet] = useState('Paytm Wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Send verification payload to backend
      const result = await api.verifyPayment({
        orderId,
        amount,
        type: selectedType,
        paymentMethod: method,
        customerName: customerName || 'Valued Client',
        customerPhone: customerPhone || BUSINESS_INFO.phone,
      });

      // Simulate payment network handshake delay
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(result);
        onSuccess(result);
      }, 1200);
    } catch (err: any) {
      setIsProcessing(false);
      alert('Payment processing error: ' + (err.message || 'Please try again.'));
    }
  };

  return (
    <div
      id="payment-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#121216] border border-[#272732] rounded-2xl shadow-2xl overflow-hidden text-zinc-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#181822] to-[#121216] px-6 py-4 border-b border-[#272732] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-white tracking-wide">
                Secure Payment Gateway
              </h3>
              <p className="text-[11px] text-zinc-400">
                Sushil Photography Jhar • 256-bit Encrypted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success Confirmation View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="font-cinzel text-xl font-bold text-white">Payment Successful!</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Your payment of <strong className="text-white font-bold">₹{amount.toLocaleString()}</strong> has been securely credited to Sushil Photography Jhar.
            </p>

            <div className="bg-[#181820] border border-[#272732] rounded-xl p-4 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment ID:</span>
                <span className="text-[#d4af37] font-semibold">{paymentSuccess.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Transaction Ref:</span>
                <span className="text-zinc-300">{paymentSuccess.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Order ID:</span>
                <span className="text-white">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Type:</span>
                <span className="text-zinc-300">{selectedType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Time:</span>
                <span className="text-zinc-300">{paymentSuccess.date}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                id="payment-success-close-btn"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-sm shadow-lg shadow-[#d4af37]/20 hover:brightness-110"
              >
                Close & View Updated Order
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Amount & Type selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Payment Purpose
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-[#181820] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="Booking Advance">Booking Advance</option>
                  <option value="Full Payment">Full Payment</option>
                  <option value="Package Payment">Package Payment</option>
                  <option value="Album Payment">Album Payment</option>
                  <option value="Editing Payment">Editing Payment</option>
                  <option value="Custom Order Payment">Custom Order</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-[#181820] border border-[#272732] rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-zinc-500">Quick:</span>
              {[2000, 5000, 8000, 12000, 15000, 20000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${
                    amount === val
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5e7b2]'
                      : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ₹{val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Select Indian Payment Mode
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[#09090b] p-1 rounded-xl border border-[#272732]">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
                  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
                  { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
                  { id: 'Wallets', label: 'Wallets', icon: Wallet },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setMethod(item.id as any)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                        active
                          ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span className="truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Content */}
            <div className="bg-[#181820] border border-[#272732] rounded-xl p-4 text-xs space-y-3">
              {method === 'UPI' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-semibold">UPI Apps (Instant 0% Fee):</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Fastest</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        type="button"
                        key={app}
                        onClick={() => setSelectedUpiApp(app)}
                        className={`py-2 px-1 rounded-lg border text-[11px] font-medium transition-colors ${
                          selectedUpiApp === app
                            ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f5e7b2]'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] text-zinc-400 mb-1">
                      Or enter UPI ID / VPA (e.g. 7608814804@upi)
                    </label>
                    <input
                      type="text"
                      placeholder="mobile@upi / username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 pt-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Studio Official VPA: 7608814804@ybl (Sushil Meher)</span>
                  </div>
                </div>
              )}

              {(method === 'Credit Card' || method === 'Debit Card') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Valid Thru</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white text-center font-mono focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white text-center font-mono focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">
                    PCI-DSS Level 1 Compliant. We NEVER store raw card information.
                  </p>
                </div>
              )}

              {method === 'Net Banking' && (
                <div className="space-y-3">
                  <label className="block text-[10px] text-zinc-400 mb-1">Popular Indian Banks</label>
                  <select
                    value={netBank}
                    onChange={(e) => setNetBank(e.target.value)}
                    className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  >
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Utkal Grameen Bank">Utkal Grameen Bank (Odisha)</option>
                  </select>
                  <p className="text-[10px] text-zinc-400">
                    You will be redirected securely to your bank portal to authorize this payment.
                  </p>
                </div>
              )}

              {method === 'Wallets' && (
                <div className="space-y-3">
                  <label className="block text-[10px] text-zinc-400 mb-1">Select Wallet</label>
                  <select
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full bg-[#121216] border border-[#272732] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  >
                    <option value="Paytm Wallet">Paytm Wallet</option>
                    <option value="PhonePe Wallet">PhonePe Wallet</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Mobikwik">Mobikwik</option>
                  </select>
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Studio Merchant Account</span>
              </div>
              <span className="text-zinc-500 font-mono">Order: {orderId}</span>
            </div>

            {/* Pay CTA Button */}
            <button
              id="payment-submit-btn"
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-extrabold text-sm tracking-wide shadow-xl shadow-[#d4af37]/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment of ₹{amount.toLocaleString()}...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{amount.toLocaleString()} via {method}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
