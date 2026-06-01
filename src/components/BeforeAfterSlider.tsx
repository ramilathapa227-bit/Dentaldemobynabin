import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { GALLERY_DATA } from '../data';
import { Calendar, User, Check, ChevronsLeftRight } from 'lucide-react';

export default function BeforeAfterSlider() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCase = GALLERY_DATA[activeCaseIndex];

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isResizing) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div id="smile-gallery" className="space-y-8">
      {/* Case Selectors */}
      <div className="flex flex-wrap justify-center gap-3">
        {GALLERY_DATA.map((item, index) => (
          <button
            key={item.id}
            id={`gallery-btn-${item.id}`}
            onClick={() => {
              setActiveCaseIndex(index);
              setSliderPosition(50);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCaseIndex === index
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-200'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            {item.treatment}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-[#E2E8F0]">
        
        {/* Left Side: Drag Simulator */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative w-full max-w-[580px] aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize border-2 border-white shadow-xl bg-white"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={() => setIsResizing(true)}
          >
            {/* After Image (Full width background) */}
            <img
              src={activeCase.afterImage}
              alt="After treatment result"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 bg-[#10B981] text-white px-3 py-1 bg-opacity-95 rounded-lg text-xs font-semibold tracking-wider uppercase z-20 shadow-sm">
              AFTER Result
            </div>

            {/* Before Image (Clipping mask) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none border-r border-[#2563EB] border-opacity-70"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={activeCase.beforeImage}
                alt="Before treatment state"
                className="absolute inset-y-0 left-0 w-full object-cover max-w-none h-full pointer-events-none"
                style={{ width: containerRef.current?.getBoundingClientRect().width }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase z-20 shadow-sm bg-opacity-95">
                BEFORE State
              </div>
            </div>

            {/* Slide Divider Bar & Handle */}
            <div
              className="absolute inset-y-0 z-30 group"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white pointer-events-none shadow-lg"></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 bg-[#2563EB] text-white rounded-full flex items-center justify-center cursor-ew-resize border-4 border-white shadow-2xl transition-transform active:scale-95 group-hover:scale-105"
              >
                <ChevronsLeftRight className="w-5 h-5" />
              </div>
            </div>

            {/* Hint Overlay (Fades out when interacted with) */}
            {sliderPosition === 50 && !isResizing && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none animate-pulse">
                <div className="bg-white/95 backdrop-blur-sm shadow-xl px-4 py-2 rounded-xl text-xs font-medium text-[#0F172A] flex items-center gap-2">
                  <span>← Drag Slider to Compare →</span>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-[#64748B] italic">
            *Slide left or right directly on the image to compare the genuine stages
          </p>
        </div>

        {/* Right Side: Case Highlights Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Clinical Case Study
            </span>
            <h4 className="text-2xl font-bold font-display text-[#0F172A] leading-tight">
              {activeCase.treatment}
            </h4>
            <p className="text-base text-[#64748B]">
              {activeCase.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E2E8F0] py-4">
            <div className="space-y-1">
              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Duration
              </span>
              <p className="text-sm font-semibold text-[#0F172A] pl-5">
                {activeCase.duration}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-[#2563EB]" /> Specialist
              </span>
              <p className="text-sm font-semibold text-[#0F172A] pl-5">
                {activeCase.specialist}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Treatment Advantages Accomplished:
            </h5>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li className="flex items-center gap-2.5">
                <span className="bg-[#10B981]/10 text-[#10B981] p-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </span>
                Fully restored facial biting geometry
              </li>
              <li className="flex items-center gap-2.5">
                <span className="bg-[#10B981]/10 text-[#10B981] p-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </span>
                Custom natural-fit aesthetic alignment
              </li>
              <li className="flex items-center gap-2.5">
                <span className="bg-[#10B981]/10 text-[#10B981] p-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </span>
                Upgraded enamel self-reflective luster
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
