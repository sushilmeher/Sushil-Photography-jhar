import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Navigation,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { api } from '../services/api';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { SocialMediaLinks } from '../components/SocialMediaLinks';

export const ContactPage: React.FC = () => {
  const { settings: socialSettings } = useSocialMedia();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.sendMessage({
        name,
        phone,
        email,
        message,
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Message error: ' + (err.message || 'Please check your connection.'));
    }
  };

  return (
    <div id="contact-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Connect With Sushil Meher</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Contact Sushil Photography Jhar
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Have a wedding date in mind or want to discuss custom album layouts? Reach out directly
            via call, WhatsApp, or drop by our studio in Jhar, Sohela.
          </p>
        </div>

        {/* 6 Quick Action Buttons Bar (Mandated by Prompt 15) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <a
            id="contact-action-call"
            href={`tel:${BUSINESS_INFO.phone}`}
            className="p-4 rounded-2xl bg-[#121216] border border-[#272732] hover:border-[#d4af37] text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <span className="block text-xs font-bold text-white">Call Now</span>
            <span className="block text-[10px] text-zinc-400 font-mono">7608814804</span>
          </a>

          <a
            id="contact-action-whatsapp"
            href={BUSINESS_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 hover:border-emerald-400 text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="block text-xs font-bold text-emerald-200">WhatsApp Chat</span>
            <span className="block text-[10px] text-emerald-400/80">Instant Reply</span>
          </a>

          <a
            id="contact-action-directions"
            href={BUSINESS_INFO.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#121216] border border-[#272732] hover:border-[#d4af37] text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="block text-xs font-bold text-white">Get Directions</span>
            <span className="block text-[10px] text-zinc-400">Jhar, Sohela</span>
          </a>

          {socialSettings.showInstagram && socialSettings.instagramUrl && (
            <a
              id="contact-action-instagram"
              href={socialSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#121216] border border-[#272732] hover:border-pink-500/60 text-center space-y-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="block text-xs font-bold text-white">Instagram</span>
              <span className="block text-[10px] text-zinc-400 truncate">Photos & Reels</span>
            </a>
          )}

          {socialSettings.showFacebook && socialSettings.facebookUrl && (
            <a
              id="contact-action-facebook"
              href={socialSettings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#121216] border border-[#272732] hover:border-blue-500/60 text-center space-y-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Facebook className="w-5 h-5" />
              </div>
              <span className="block text-xs font-bold text-white">Facebook</span>
              <span className="block text-[10px] text-zinc-400 truncate">Community</span>
            </a>
          )}

          {socialSettings.showYouTube && socialSettings.youtubeUrl && (
            <a
              id="contact-action-youtube"
              href={socialSettings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#121216] border border-[#272732] hover:border-red-500/60 text-center space-y-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Youtube className="w-5 h-5" />
              </div>
              <span className="block text-xs font-bold text-white">YouTube</span>
              <span className="block text-[10px] text-zinc-400 truncate">4K Wedding Films</span>
            </a>
          )}
        </div>

        {/* Dedicated Social Media Channels Grid (Admin Editable) */}
        <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>Official Social Media Channels</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Explore real wedding teasers, behind-the-scenes shoots, and client reviews on our verified channels.
              </p>
            </div>
          </div>
          <SocialMediaLinks variant="contact" />
        </div>

        {/* Contact Form & Studio Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Details & Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-white">
                Studio Headquarters & Information
              </h3>

              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Studio Location:</strong>
                    <span>{BUSINESS_INFO.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Telephone & Inquiries:</strong>
                    <div className="space-x-3">
                      <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:text-white font-mono">
                        +91 {BUSINESS_INFO.phone}
                      </a>
                      <a href={`tel:${BUSINESS_INFO.secondaryPhone}`} className="hover:text-white font-mono text-zinc-400">
                        +91 {BUSINESS_INFO.secondaryPhone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Official Email:</strong>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Studio Operating Hours:</strong>
                    <span>{BUSINESS_INFO.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Google Map Embed */}
              <div className="pt-2">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#272732] bg-zinc-900">
                  <iframe
                    title="Sushil Photography Jhar Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14878.530366059296!2d83.4735957!3d21.2067756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2153b6f041b3a5%3A0xb351f041b3a5a78!2sSohela%2C%20Odisha%20768033!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                    className="w-full h-full border-0 filter grayscale invert contrast-125"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm text-[10px] text-zinc-300 font-mono">
                    Jhar, Sohela, Bargarh
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form (Mandated by Prompt 15) */}
          <div className="lg:col-span-6">
            <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-white">Send Direct Inquiry</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Leave your details and Sushil Meher will get back to you with custom package advice.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-[#181820] rounded-2xl border border-[#272732] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-cinzel text-lg font-bold text-white">Message Dispatched!</h4>
                  <p className="text-xs text-zinc-400">
                    Thank you. We have received your inquiry and will call or message on WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#272732] text-xs font-semibold text-zinc-300"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Message / Event Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your event date, required services, or album questions..."
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <button
                    id="contact-send-message-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4 text-black" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
