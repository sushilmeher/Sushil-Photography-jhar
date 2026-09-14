import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Camera,
  FileText,
} from 'lucide-react';
import { PaymentReceiptData } from '../types';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  receiptData: PaymentReceiptData | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  receiptData,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
============================================================
              SUSHIL PHOTOGRAPHY JHAR
        Official Payment Receipt & Tax Voucher
============================================================
Business Name  : ${receiptData.businessName}
Owner / Artist : ${receiptData.ownerName}
Payment Contact: ${receiptData.paymentPhone}
Secondary Phone: ${receiptData.secondaryPhone}
Studio Address : ${receiptData.studioAddress}
------------------------------------------------------------
RECEIPT DETAILS
------------------------------------------------------------
Receipt Number : ${receiptData.receiptNumber}
Payment ID     : ${receiptData.paymentId}
Order ID       : ${receiptData.orderId}
Payment Date   : ${receiptData.paymentDate}
Payment Status : ${receiptData.paymentStatus}
Payment Method : ${receiptData.paymentMethod}
Transaction Ref: ${receiptData.transactionId}

------------------------------------------------------------
CUSTOMER DETAILS
------------------------------------------------------------
Customer Name  : ${receiptData.customerName}
Phone Number   : ${receiptData.customerPhone || 'N/A'}
Email Address  : ${receiptData.customerEmail || 'N/A'}
City / Address : ${receiptData.customerAddress || 'N/A'}

------------------------------------------------------------
SERVICE & AMOUNT DETAILS
------------------------------------------------------------
Service Rendered: ${receiptData.service}
Amount Paid     : INR ₹${receiptData.amount.toLocaleString('en-IN')}
Total Bill Amt  : INR ₹${(receiptData.totalAmount || receiptData.amount).toLocaleString('en-IN')}
Total Advance   : INR ₹${(receiptData.advanceAmount || receiptData.amount).toLocaleString('en-IN')}
Remaining Dues  : INR ₹${(receiptData.remainingAmount || 0).toLocaleString('en-IN')}

Notes: ${receiptData.notes || 'Thank you for choosing Sushil Photography Jhar.'}

------------------------------------------------------------
Authorized Signatory: Sushil Meher (Founder & Lead Artist)
Capturing Your Beautiful Moments • Jhar, Sohela, Bargarh
============================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receiptData.receiptNumber}_Sushil_Photography.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="payment-receipt-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0e0e13] border border-[#272732] rounded-3xl shadow-2xl overflow-hidden text-zinc-200 my-6 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header bar (hidden on print) */}
        <div className="bg-[#15151c] px-6 py-4 border-b border-[#272732] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-white tracking-wide">
                Official Payment Receipt
              </h3>
              <p className="text-[11px] text-zinc-400">
                Receipt #{receiptData.receiptNumber} • Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              id="download-receipt-btn"
              onClick={handleDownloadText}
              className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e5c158] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Download Receipt Copy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div
          ref={receiptRef}
          className="p-6 sm:p-8 space-y-6 print:p-6 print:space-y-4 print:text-black"
        >
          {/* Studio Brand Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#272732] print:border-gray-300 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#b6891a] to-[#805c08] p-0.5 flex items-center justify-center shadow-lg print:border print:border-amber-600">
                <div className="w-full h-full bg-[#0e0e13] print:bg-white rounded-[10px] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#d4af37] print:text-amber-800" />
                </div>
              </div>
              <div>
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-white print:text-black">
                  {receiptData.businessName}
                </h1>
                <p className="text-xs text-[#d4af37] font-medium tracking-wide">
                  Lead Artist & Founder: {receiptData.ownerName}
                </p>
                <p className="text-[11px] text-zinc-400 print:text-gray-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#d4af37]" />
                  {receiptData.studioAddress}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-zinc-400 print:text-gray-600 space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:text-emerald-700 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{receiptData.paymentStatus}</span>
              </div>
              <div className="font-mono text-zinc-300 print:text-black text-xs font-semibold">
                Receipt: {receiptData.receiptNumber}
              </div>
              <div className="text-[11px]">
                Date: {receiptData.paymentDate}
              </div>
            </div>
          </div>

          {/* Contacts banner */}
          <div className="bg-[#14141b] print:bg-gray-100 rounded-xl p-3 border border-[#272732] print:border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-zinc-400 print:text-gray-600">Payment Helpdesk:</span>
              <a href={`tel:${receiptData.paymentPhone}`} className="text-white print:text-black font-semibold">
                +91 {receiptData.paymentPhone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-400 print:text-gray-600">Secondary Contact:</span>
              <a href={`tel:${receiptData.secondaryPhone}`} className="text-white print:text-black font-semibold">
                +91 {receiptData.secondaryPhone}
              </a>
            </div>
          </div>

          {/* Customer & Transaction Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#121217] print:bg-gray-50 border border-[#272732] print:border-gray-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">
                Billed To (Client Details)
              </span>
              <div className="font-semibold text-white print:text-black text-sm">
                {receiptData.customerName}
              </div>
              {receiptData.customerPhone && (
                <div className="text-zinc-400 print:text-gray-600 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-zinc-500" />
                  <span>+91 {receiptData.customerPhone}</span>
                </div>
              )}
              {receiptData.customerEmail && (
                <div className="text-zinc-400 print:text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-zinc-500" />
                  <span>{receiptData.customerEmail}</span>
                </div>
              )}
              <div className="text-zinc-400 print:text-gray-600 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-zinc-500" />
                <span>{receiptData.customerAddress || 'Odisha, India'}</span>
              </div>
            </div>

            <div className="bg-[#121217] print:bg-gray-50 border border-[#272732] print:border-gray-200 rounded-2xl p-4 space-y-2 font-mono">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] font-sans block">
                Transaction References
              </span>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-gray-600">Payment ID:</span>
                <span className="text-[#d4af37] font-bold">{receiptData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-gray-600">Order ID:</span>
                <span className="text-white print:text-black font-semibold">{receiptData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-gray-600">Method:</span>
                <span className="text-zinc-200 print:text-black">{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 print:text-gray-600">Txn / UTR:</span>
                <span className="text-zinc-200 print:text-black truncate max-w-[180px]" title={receiptData.transactionId}>
                  {receiptData.transactionId}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Line Item Table */}
          <div className="border border-[#272732] print:border-gray-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181820] print:bg-gray-100 text-zinc-400 print:text-gray-700 border-b border-[#272732] print:border-gray-300 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272732] print:divide-gray-200">
                <tr className="bg-[#101015] print:bg-white">
                  <td className="py-3.5 px-4 font-semibold text-white print:text-black">
                    {receiptData.service}
                    <div className="text-[11px] font-normal text-zinc-400 print:text-gray-600 mt-0.5">
                      Professional production by Sushil Photography Jhar
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:text-emerald-800">
                      {receiptData.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white print:text-black text-sm">
                    ₹{receiptData.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-[#14141c] print:bg-gray-50 border-t border-[#272732] print:border-gray-300">
                {receiptData.totalAmount !== undefined && (
                  <tr>
                    <td colSpan={2} className="py-2 px-4 text-right text-zinc-400 print:text-gray-600">
                      Total Order Amount:
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-zinc-300 print:text-gray-800">
                      ₹{receiptData.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {receiptData.advanceAmount !== undefined && (
                  <tr>
                    <td colSpan={2} className="py-2 px-4 text-right text-zinc-400 print:text-gray-600">
                      Total Paid / Advance to Date:
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-400 print:text-emerald-700 font-semibold">
                      ₹{receiptData.advanceAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {receiptData.remainingAmount !== undefined && (
                  <tr>
                    <td colSpan={2} className="py-2.5 px-4 text-right font-semibold text-zinc-300 print:text-gray-800">
                      Remaining Balance Due:
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-400 print:text-amber-800">
                      ₹{receiptData.remainingAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-[#272732] print:border-gray-300 bg-[#191924] print:bg-gray-100">
                  <td colSpan={2} className="py-3 px-4 font-cinzel text-sm font-bold text-[#d4af37] print:text-amber-800">
                    Net Paid in This Voucher:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base font-bold text-[#d4af37] print:text-amber-800">
                    ₹{receiptData.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer note & Authenticity Guarantee */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#272732] print:border-gray-300 gap-4 text-xs">
            <div className="flex items-center gap-2 text-zinc-400 print:text-gray-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Computer-generated official receipt issued by Sushil Photography Jhar.</span>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-cinzel font-bold text-white print:text-black tracking-wide text-sm">
                Sushil Meher
              </div>
              <div className="text-[10px] text-zinc-400 print:text-gray-600 uppercase tracking-widest">
                Founder & Lead Photographer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
