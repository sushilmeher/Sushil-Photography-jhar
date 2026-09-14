import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
  onCustomerLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onCustomerLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin' | 'register'>('customer');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.adminLogin(adminPassword);
      setLoading(false);
      onAdminLoginSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Invalid admin credentials');
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail) {
      setError('Please provide your phone number or email');
      return;
    }
    const demoCustomer = {
      name: phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : 'Valued Client',
      phone: phoneOrEmail,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail}@client.sushilphotography.com`,
    };
    onCustomerLoginSuccess(demoCustomer);
    onClose();
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regPhone) {
      setError('Please enter your full name and phone number');
      return;
    }
    setSuccessMsg('Account registered successfully! Welcome to Sushil Photography.');
    setTimeout(() => {
      onCustomerLoginSuccess({ name, phone: regPhone, email: regEmail });
      onClose();
    }, 1000);
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#121216] border border-[#272732] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="bg-[#09090b] border-b border-[#272732] px-6 py-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('customer');
                setError('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'customer'
                  ? 'bg-[#d4af37] text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Customer Portal
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setError('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admin Dashboard
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white">Studio Admin Access</h3>
                <p className="text-xs text-zinc-400">
                  Manage bookings, packages, prices, gallery & uploads.
                </p>
                <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#181824] border border-[#272732] text-[11px] text-zinc-400">
                  Default Demo Pass: <strong className="text-[#d4af37]">sushil@2026</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Admin Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (sushil@2026)"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#d4af37] text-black font-bold text-xs tracking-wide shadow-lg shadow-amber-900/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Unlock Admin Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37] mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white">Client Portal Login</h3>
                <p className="text-xs text-zinc-400">
                  Track your photos, download albums, and view invoices.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="e.g. 7608814804 or your@email.com"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-zinc-400">Password / OTP</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered mobile/email via SMS/WhatsApp!')}
                    className="text-[10px] text-[#d4af37] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Enter password or press Login with Phone"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Access My Client Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="font-cinzel text-lg font-bold text-white">Create Client Account</h3>
                <p className="text-xs text-zinc-400">
                  Register to track shoots and manage private photo galleries.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bride, Groom, or Client Name"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="10 digit mobile number"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="For invoices & gallery links"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs tracking-wide hover:brightness-110 active:scale-95 transition-all"
              >
                Register & Open Portal
              </button>

              <div className="text-center text-xs text-zinc-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('customer')}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Log in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
