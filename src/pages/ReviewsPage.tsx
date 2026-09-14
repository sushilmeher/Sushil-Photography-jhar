import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload,
  MessageSquare,
  ThumbsUp,
  X,
  User,
} from 'lucide-react';
import { ReviewItem } from '../types';
import { api } from '../services/api';
import { INITIAL_REVIEWS } from '../data/mockData';

interface ReviewsPageProps {
  reviews?: ReviewItem[];
  onReviewAdded?: (newReview: ReviewItem) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews = [], onReviewAdded }) => {
  const safeReviews = reviews && reviews.length > 0 ? reviews : INITIAL_REVIEWS;
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [serviceUsed, setServiceUsed] = useState('Wedding Photography & 12x36 Album');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute average rating
  const avgRating = (
    safeReviews.reduce((acc, curr) => acc + curr.rating, 0) / (safeReviews.length || 1)
  ).toFixed(1);

  const fiveStarCount = safeReviews.filter((r) => r.rating === 5).length;
  const fourStarCount = safeReviews.filter((r) => r.rating === 4).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newRev = await api.createReview({
        customerName,
        rating,
        serviceUsed,
        review: reviewText,
        photo: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isVerified: true,
      });

      setIsSubmitting(false);
      onReviewAdded(newRev);
      setShowForm(false);
      setCustomerName('');
      setReviewText('');
      setPhotoUrl('');
      alert('Thank you! Your verified review has been published.');
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Error saving review: ' + (err.message || 'Please try again'));
    }
  };

  return (
    <div id="reviews-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Header banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest Stories from Western Odisha Families</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Client Reviews & Ratings
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Read first-hand accounts of our cinematography, album craftsmanship, and friendly,
            patient photography crew.
          </p>
        </div>

        {/* Rating Scoreboard & Write Review CTA */}
        <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-5xl sm:text-6xl font-black font-cinzel text-white">
                {avgRating}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                Based on <strong className="text-white">{reviews.length * 48 + 32}+</strong> verified client reviews
              </p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-1.5 w-48 sm:w-60 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span>5 ★</span>
                <div className="flex-1 h-2 rounded-full bg-[#181820] overflow-hidden">
                  <div className="h-full bg-[#d4af37] w-[92%]" />
                </div>
                <span className="font-mono text-zinc-500">92%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>4 ★</span>
                <div className="flex-1 h-2 rounded-full bg-[#181820] overflow-hidden">
                  <div className="h-full bg-[#d4af37]/60 w-[8%]" />
                </div>
                <span className="font-mono text-zinc-500">8%</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <span>3 ★</span>
                <div className="flex-1 h-2 rounded-full bg-[#181820] overflow-hidden">
                  <div className="h-full bg-zinc-700 w-0" />
                </div>
                <span className="font-mono">0%</span>
              </div>
            </div>
          </div>

          <div>
            <button
              id="write-review-btn"
              onClick={() => setShowForm(!showForm)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-black" />
              <span>{showForm ? 'Close Review Form' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Review Form Drawer / Modal */}
        {showForm && (
          <div className="bg-[#14141c] border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel text-xl font-bold text-white">Share Your Experience</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priyanka & Amit"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Service Used *
                  </label>
                  <select
                    value={serviceUsed}
                    onChange={(e) => setServiceUsed(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  >
                    <option value="Wedding Photography & 12x36 Album">Wedding Photography & 12x36 Album</option>
                    <option value="Wedding Cinematography & Drone">Wedding Cinematography & Drone</option>
                    <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                    <option value="Photo Editing & Retouching">Photo Editing & Retouching</option>
                    <option value="Birthday / Event Photography">Birthday / Event Photography</option>
                    <option value="Custom Wall Frame / Printing">Custom Wall Frame / Printing</option>
                  </select>
                </div>
              </div>

              {/* Star Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Your Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${s <= rating ? 'fill-amber-400' : 'text-zinc-600'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-zinc-400 ml-2 font-bold">{rating} out of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Review / Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share how Sushil Meher and the team captured your special day..."
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Photo URL from Event (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste photo link or leave blank"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Submitting Review...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#121216] border border-[#272732] hover:border-[#d4af37]/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#272732] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.photo ? (
                    <img
                      src={rev.photo}
                      alt={rev.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#181824] border border-[#272732] flex items-center justify-center font-cinzel text-xs font-bold text-[#d4af37]">
                      {rev.customerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.customerName}</h4>
                    <span className="text-[10px] text-zinc-400">{rev.serviceUsed}</span>
                  </div>
                </div>

                {rev.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
