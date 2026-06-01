import { useState } from 'react';
import { REVIEWS_DATA } from '../data';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS_DATA.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === REVIEWS_DATA.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Testimonials Desktop Grid (Shows 3 at a time) */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {REVIEWS_DATA.map((review) => (
          <div
            key={review.id}
            id={`review-card-desktop-${review.id}`}
            className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Stars & Verified */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {review.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Patient
                  </span>
                )}
              </div>

              {/* Treatment Type Badge */}
              <div className="inline-flex self-start text-xs font-semibold text-[#2563EB] bg-blue-50/80 px-3 py-1 rounded-full">
                Treatment: {review.treatmentName}
              </div>

              {/* Patient Comment */}
              <p className="text-[#64748B] text-sm leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-[#F1F5F9]">
              <img
                src={review.avatarUrl}
                alt={review.name}
                className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h5 className="text-sm font-semibold text-[#0F172A]">{review.name}</h5>
                <p className="text-xs text-[#64748B]">{review.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials Tablet & Mobile Carousel (Shows 1 or 2 card layout) */}
      <div className="lg:hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active reviews based on window index, standard single or double card wrapper */}
          <div
            id={`review-card-mobile-${REVIEWS_DATA[currentIndex].id}`}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: REVIEWS_DATA[currentIndex].rating }).map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {REVIEWS_DATA[currentIndex].verified && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>

              <div className="inline-flex self-start text-xs font-semibold text-[#2563EB] bg-blue-50/80 px-3 py-1 rounded-full">
                Treatment: {REVIEWS_DATA[currentIndex].treatmentName}
              </div>

              <p className="text-[#64748B] text-sm leading-relaxed italic">
                "{REVIEWS_DATA[currentIndex].comment}"
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-3 border-t border-[#F1F5F9]">
              <img
                src={REVIEWS_DATA[currentIndex].avatarUrl}
                alt={REVIEWS_DATA[currentIndex].name}
                className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h5 className="text-sm font-semibold text-[#0F172A]">{REVIEWS_DATA[currentIndex].name}</h5>
                <p className="text-xs text-[#64748B]">{REVIEWS_DATA[currentIndex].date}</p>
              </div>
            </div>
          </div>

          {/* Show a second card on tablets */}
          <div
            id={`review-card-tablet-companion`}
            className="hidden md:flex flex-col justify-between bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm"
          >
            {(() => {
              const companionIndex = (currentIndex + 1) % REVIEWS_DATA.length;
              const companion = REVIEWS_DATA[companionIndex];
              return (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {Array.from({ length: companion.rating }).map((_, i) => (
                          <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {companion.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>

                    <div className="inline-flex self-start text-xs font-semibold text-[#2563EB] bg-blue-50/80 px-3 py-1 rounded-full">
                      Treatment: {companion.treatmentName}
                    </div>

                    <p className="text-[#64748B] text-sm leading-relaxed italic">
                      "{companion.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-6 pt-3 border-t border-[#F1F5F9]">
                    <img
                      src={companion.avatarUrl}
                      alt={companion.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-[#0F172A]">{companion.name}</h5>
                      <p className="text-xs text-[#64748B]">{companion.date}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Navigation Contols (Mobile Carousel) */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            id="review-prev-btn"
            onClick={prevSlide}
            className="p-2 rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5">
            {REVIEWS_DATA.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-5 bg-[#2563EB]' : 'bg-[#E2E8F0]'
                }`}
              ></button>
            ))}
          </div>

          <button
            id="review-next-btn"
            onClick={nextSlide}
            className="p-2 rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
