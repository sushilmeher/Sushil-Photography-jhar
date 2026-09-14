import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, Camera } from 'lucide-react';
import { InvoiceData } from '../types';
import { BUSINESS_INFO } from '../data/mockData';

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="invoice-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="bg-[#09090b] text-white px-6 py-4 flex items-center justify-between border-b border-[#272732] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm font-bold text-[#d4af37]">Official Studio Invoice</span>
            <span className="text-xs text-zinc-400">({invoice.invoiceNumber})</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="invoice-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e5c158] transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div ref={printRef} className="p-8 sm:p-10 bg-white font-sans text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b-2 border-zinc-900 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-[#d4af37]">
                  <Camera className="w-4 h-4" />
                </div>
                <h1 className="font-cinzel text-2xl font-black tracking-wider text-black">
                  SUSHIL <span className="text-[#996515]">PHOTOGRAPHY JHAR</span>
                </h1>
              </div>
              <p className="text-xs font-semibold text-zinc-800">
                Owner: {BUSINESS_INFO.owner} ({BUSINESS_INFO.ownerRole})
              </p>
              <p className="text-xs text-zinc-600">Location: {BUSINESS_INFO.location}</p>
              <p className="text-xs text-zinc-600">
                Phone: +91 {BUSINESS_INFO.phone} / {BUSINESS_INFO.secondaryPhone}
              </p>
              <p className="text-xs text-zinc-600">Website: {BUSINESS_INFO.website}</p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <span className="text-xs font-bold tracking-widest text-[#996515] uppercase block">
                TAX INVOICE
              </span>
              <div className="text-lg font-black text-zinc-900 font-mono">
                {invoice.invoiceNumber}
              </div>
              <p className="text-xs text-zinc-600">Date: {invoice.date}</p>
              <p className="text-xs text-zinc-600">Order ID: <strong className="font-mono text-black">{invoice.orderId}</strong></p>
              <div className="pt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    invoice.paymentStatus === 'Paid Full'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                BILLED TO (CLIENT)
              </span>
              <h2 className="text-sm font-bold text-black">{invoice.customerName}</h2>
              <p className="text-zinc-600 mt-1">Phone: +91 {invoice.customerPhone}</p>
              {invoice.customerEmail && <p className="text-zinc-600">Email: {invoice.customerEmail}</p>}
              <p className="text-zinc-600">{invoice.customerAddress || 'Odisha, India'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                EVENT & PRODUCTION DETAILS
              </span>
              <p className="text-zinc-700"><strong>Primary Service:</strong> {invoice.service}</p>
              {invoice.packageName && <p className="text-zinc-700"><strong>Package:</strong> {invoice.packageName}</p>}
              <p className="text-zinc-700"><strong>Event Date / Schedule:</strong> {invoice.dueDate}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 bg-zinc-100 text-zinc-800 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-medium text-zinc-800">{item.description}</td>
                    <td className="py-3 px-3 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">₹{item.rate.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Advance / Balance calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-zinc-200">
            <div className="text-xs text-zinc-600 max-w-sm space-y-2">
              <h3 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px]">Payment Terms & Notes:</h3>
              <p className="text-[11px] leading-relaxed">
                1. Advance payment confirms booking dates and equipment reservation.
                <br />
                2. Balance amount payable upon final photo selection / album preview delivery.
                <br />
                3. Raw & retouched photos stored securely in cloud for 90 days.
              </p>
            </div>

            <div className="w-full sm:w-64 bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Total Package Price:</span>
                <span className="font-semibold text-black">₹{invoice.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Advance Paid:</span>
                <span>- ₹{invoice.advance.toLocaleString()}</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-black">
                <span>Remaining Balance:</span>
                <span className={invoice.remainingAmount > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                  ₹{invoice.remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signature */}
          <div className="mt-12 pt-6 border-t border-zinc-200 flex justify-between items-end text-xs">
            <div>
              <p className="font-mono text-[10px] text-zinc-400">Generated by Sushil Photography Jhar Cloud Billing</p>
              <p className="text-zinc-500">Thank you for trusting Sushil Photography to preserve your special memories!</p>
            </div>
            <div className="text-center space-y-2">
              <div className="font-serif italic text-lg font-bold text-[#996515]">
                Sushil Meher
              </div>
              <div className="w-32 border-t border-zinc-900 mx-auto"></div>
              <p className="text-[10px] uppercase font-bold text-zinc-700">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
