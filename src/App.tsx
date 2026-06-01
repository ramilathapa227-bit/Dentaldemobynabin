import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Activity, Sparkles, Workflow, ShieldAlert, Hammer, HeartHandshake, Scissors, Sun,
  MapPin, Phone, Mail, Clock, Star, Menu, X, ChevronDown, Check, Award, Heart, Stethoscope, 
  Smile, ShieldCheck, ChevronRight, PhoneCall, Calendar, ArrowRight, MessageSquare, Shield
} from 'lucide-react';
import { SERVICES_DATA, DENTISTS_DATA } from './data';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import ReviewCarousel from './components/ReviewCarousel';
import FAQAccordion from './components/FAQAccordion';
import ClinicMap from './components/ClinicMap';
import AppointmentModal from './components/AppointmentModal';
import AdminPortal from './components/AdminPortal';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Appointment modal controller
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [presetService, setPresetService] = useState('');
  const [presetDentist, setPresetDentist] = useState('');

  // Selected Service detail modal for "Learn More" in Services section
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<typeof SERVICES_DATA[0] | null>(null);

  // Contact Form Submission State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: ''
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Monitor Scroll Position for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerBooking = (srvId = '', denId = '') => {
    setPresetService(srvId);
    setPresetDentist(denId);
    setIsModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.service) {
      alert('Please fill out all mandatory contact fields');
      return;
    }

    const messageId = `msg-${Date.now()}`;
    const newMessage = {
      ...contactForm,
      id: messageId,
      createdAt: new Date().toISOString()
    };

    // 1. Try writing to Firestore ("messages" collection)
    try {
      const docRef = doc(db, 'messages', messageId);
      await setDoc(docRef, newMessage);
      console.log("Contact inquiry successfully securely recorded in Firestore!");
    } catch (err) {
      console.error("Firestore message write failed:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `messages/${messageId}`);
      } catch (logErr) {}
    }

    // 2. Always persist into LocalStorage representing our reliable client fallback matching core user data patterns
    try {
      const stored = localStorage.getItem('dental_contact_messages');
      const messages = stored ? JSON.parse(stored) : [];
      localStorage.setItem('dental_contact_messages', JSON.stringify([newMessage, ...messages]));
      setContactSuccess(true);
      setContactForm({ name: '', phone: '', email: '', service: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to map icon names to Lucide elements
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity className="w-6 h-6 text-[#2563EB]" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-[#2563EB]" />;
      case 'Workflow': return <Workflow className="w-6 h-6 text-[#2563EB]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-[#2563EB]" />;
      case 'Hammer': return <Hammer className="w-6 h-6 text-[#2563EB]" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-[#2563EB]" />;
      case 'Scissors': return <Scissors className="w-6 h-6 text-[#2563EB]" />;
      case 'Sun': return <Sun className="w-6 h-6 text-[#2563EB]" />;
      default: return <Stethoscope className="w-6 h-6 text-[#2563EB]" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* 1. STICKY NAVBAR */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0] py-3' 
            : 'bg-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="p-2 bg-[#2563EB] text-white rounded-xl shadow-lg shadow-blue-150 transition-transform group-hover:scale-105">
              <Smile className="w-6 h-6" />
            </div>
            <span className="text-xl sm:text-2xl font-black font-display text-[#0F172A] tracking-tight">
              DentalDemo<span className="text-[#2563EB]">ByNabin</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#home" className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">Home</a>
            <a href="#services" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">Services</a>
            <a href="#about" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">About</a>
            <a href="#gallery" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">Gallery</a>
            <a href="#reviews" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">Reviews</a>
            <a href="#faq" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">FAQ</a>
            <a href="#contact" className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] hover:text-[#0F172A] transition-colors">Contact</a>
          </nav>

          {/* Desktop Right: Book Button */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsAdminPortalOpen(true)}
              className="text-xs font-bold text-slate-750 hover:text-[#2563EB] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Admin Office</span>
            </button>
            <a 
              href="tel:+15550199222" 
              className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4 text-[#2563EB]" />
              +1 (555) 019-9222
            </a>
            <button
              id="cta-nav-booking"
              onClick={() => triggerBooking()}
              className="px-6 py-2.5 bg-[#2563EB] hover:opacity-90 text-white font-semibold rounded-full text-sm transition-all shadow-md active:scale-98"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Right Controls: Book Button (remaining visible) & Hamburg */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              id="cta-mobile-quick"
              onClick={() => triggerBooking()}
              className="px-5 py-2 bg-[#2563EB] hover:opacity-90 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
            >
              Book
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2E8F0] absolute top-full left-0 right-0 py-5 px-6 space-y-4 shadow-xl z-50 animate-fadeIn">
            <div className="flex flex-col gap-3">
              <a 
                href="#home" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#0F172A] hover:text-[#2563EB] py-1 transition-colors"
              >
                Home
              </a>
              <a 
                href="#services" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                Services
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                About Us
              </a>
              <a 
                href="#gallery" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                Smile Gallery (Transformations)
              </a>
              <a 
                href="#reviews" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                Reviews
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                FAQ
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#64748B] hover:text-[#2563EB] py-1 transition-colors"
              >
                Contact Info
              </a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAdminPortalOpen(true);
                }}
                className="text-base font-semibold text-rose-600 hover:text-[#2563EB] py-1 transition-colors flex items-center gap-2 text-left"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Clinical Admin Portal</span>
              </button>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
              <a 
                href="tel:+15550199222" 
                className="text-sm font-bold text-[#0F172A] flex items-center justify-center gap-2 py-2.5 bg-slate-50 rounded-xl"
              >
                <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                Call: +1 (555) 019-9222
              </a>
            </div>
          </div>
        )}
      </header>


      {/* 2. HERO SECTION */}
      <section 
        id="home" 
        className="pt-28 pb-16 sm:pb-24 px-6 sm:px-8 bg-gradient-to-b from-[#F8FAFC]/50 to-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8 text-left animate-fadeIn">
            
            {/* Status Batch */}
            <div className="inline-flex items-center gap-2 bg-[#10B981]/10 text-[#10B981] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-[#10B981]/20">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              ✓ Accepting New Patients
            </div>

            {/* Main Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-[#0F172A] leading-tight tracking-tight">
              Healthy Smiles <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">Start Here</span>
            </h1>

            {/* Description Subheadline */}
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
              Professional dental care built with modern clinical technology, highly credentialed dentists, and absolute patient comfort in mind. We provide comprehensive treatments for every stage of life.
            </p>

            {/* Actions Links buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="hero-btt-book"
                onClick={() => triggerBooking()}
                className="px-8 py-3.5 bg-[#2563EB] hover:opacity-95 text-white font-bold rounded-full text-base shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a
                href="tel:+15550199222"
                className="px-8 py-3.5 bg-white hover:bg-slate-50 text-[#0F172A] font-bold rounded-full text-base border-2 border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 text-[#2563EB]" />
                Call Now
              </a>
            </div>

            {/* Quick trust bullet points */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Licensed Dentists</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Modern Equipment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Emergency Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Affordable Pricing</span>
              </div>
            </div>

          </div>

          {/* Right Column: Imagery Stage */}
          <div className="lg:col-span-6 relative flex items-center justify-center mt-6 lg:mt-0">
            {/* Ambient Backdrops circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[450px] sm:h-[450px] bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none -z-10"></div>
            
            {/* Primary Frame */}
            <div className="relative w-full max-w-[500px] aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-[480px] bg-slate-100 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-300">
              <img 
                src="/src/assets/images/hero_dental_clinic_1780286089381.png" 
                alt="Elite Dentist treating young patient smiling at DentalDemoByNabin clinic"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Float badge widget 1 */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3.5 max-w-xs animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="p-2.5 bg-green-50 text-[#10B981] rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[#0F172A] font-bold text-sm">#1 Dental Provider</p>
                  <p className="text-[#64748B] text-xs">Rated 5.0 stars in Blue Hills metro</p>
                </div>
              </div>

              {/* Float badge widget 2 (Interactive appointment helper) */}
              <button 
                onClick={() => triggerBooking()}
                className="absolute top-6 right-6 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Immediate Openings</span>
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* 3. HERO WHY CHOOSE US CARDS */}
      <section className="py-6 px-6 sm:px-8 bg-white relative z-10 -mt-8 sm:-mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-[#2563EB]/10 text-[#2563EB] rounded-full flex items-center justify-center shadow-sm mb-4">
                <Stethoscope className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">Experienced Dentists</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Certified and skilled professionals holding degrees from elite medical academies.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-[#2563EB]/10 text-[#2563EB] rounded-full flex items-center justify-center shadow-sm mb-4">
                <SettingsShieldIcon />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">Advanced Technology</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Using microscopic intraoral laser scanners, digital radiography, and painless lasers.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-[#2563EB]/10 text-[#2563EB] rounded-full flex items-center justify-center shadow-sm mb-4">
                <WalletIcon />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">Affordable Care</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Transparent dental treatment estimates with flexible payment terms and co-pay plans.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-[#10B981]/15 text-[#10B981] rounded-full flex items-center justify-center shadow-sm mb-4">
                <BellRingingIcon />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">Emergency Services</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Fast priority bookings to rapidly treat severe toothaches and mechanical chips.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0] px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Headers */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              What We Do
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-display tracking-tight">
              Our Dental Services
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Comprehensive dental treatments, routine checkups, and orthodontic alignments custom tailored by specialists.
            </p>
          </div>

          {/* Core Grid Cards (8 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_DATA.map((service) => (
              <div 
                key={service.id} 
                id={`service-card-${service.id}`}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-300 text-left group"
              >
                <div className="space-y-4">
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-blue-50/80 rounded-xl">
                      {getServiceIcon(service.iconName)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded">
                      {service.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-[#0F172A] font-display group-hover:text-[#2563EB] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-[#F8FAFC] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedServiceDetail(service)}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => triggerBooking(service.id)}
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1.5"
                  >
                    <span>Book Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. ABOUT CLINIC SECTION */}
      <section id="about" className="py-20 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column Visual Frame */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-50 rounded-3xl -z-10 pointer-events-none"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-50 rounded-3xl -z-10 pointer-events-none"></div>
            
            <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
              <img 
                src="/src/assets/images/clinic_interior_about_1780286126686.png" 
                alt="Panoramic view of inside DentalDemoByNabin modern premium aesthetic dental parlor waiting area"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Overlay Stat widget */}
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="text-2xl font-black font-display text-[#10B981]">100% sterile</p>
                <p className="text-[11px] uppercase tracking-wide opacity-90 font-semibold">Clinically Certified Environment</p>
              </div>
            </div>
          </div>

          {/* Right Column About Content */}
          <div className="lg:col-span-6 text-left space-y-6 lg:space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
                About DentalDemoByNabin
              </h2>
            </div>

            <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
              Serving the Blue Hills metro for over a decade, we have established our clinical mission around two simple ideals: robust professional excellence and high-trust compassionate care. From orthodontic corrections to full-mouth restorative architectures, our clinic delivers unmatched patient-centered precision.
            </p>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">Highest Professional Accreditations</p>
                  <p className="text-xs text-[#64748B]">All leading practitioners are board-certified members of premier global dental academies.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">Completely Painless Micro-dentistry</p>
                  <p className="text-xs text-[#64748B]">Utilizing computer-measured anesthetic sprays, making deep treats absolutely strain-free.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-blue-50 text-[#2563EB] p-1 rounded-full shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">Flexible Patient Care Schemes</p>
                  <p className="text-xs text-[#64748B]">Personalized interest-free installation schemes for high-end aesthetic dental implants.</p>
                </div>
              </li>
            </ul>

            {/* Metric counters */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-[#E2E8F0]">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#2563EB] font-display">15+ Years</p>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Clinical Experience</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#10B981] font-display">5,000+</p>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Happy Patients</p>
              </div>
            </div>

            <div className="pt-2 flex">
              <button
                onClick={() => {
                  const target = document.getElementById('contact');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-slate-900 hover:opacity-90 text-white font-semibold rounded-full text-xs sm:text-sm transition-all shadow-sm"
              >
                Learn More About Clinic
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* 6. BEFORE & AFTER GALLERY SECTION */}
      <section id="gallery" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0] px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header titles */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Real Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
              Smile Transformations
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Interact with the slider directly to observe our premium dental cosmetic treatments before & after transformations.
            </p>
          </div>

          {/* Interactive BeforeAfter Slider widget */}
          <BeforeAfterSlider />

        </div>
      </section>


      {/* 7. SPECIALIST TEAM SECTION */}
      <section className="py-20 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header titles */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Clinical Leaders
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
              Meet Our Dental Specialists
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Highly credentialed dentists specializing in orthodontics, surgery, and painless restorations.
            </p>
          </div>

          {/* Specialist Doctors Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DENTISTS_DATA.map((dentist) => (
              <div 
                key={dentist.id} 
                id={`doctor-card-${dentist.id}`}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Doctor Headshot with subtle gradient tint */}
                <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#F8FAFC] overflow-hidden">
                  <img 
                    src={dentist.imageUrl} 
                    alt={dentist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#2563EB] border border-blue-50 shadow-sm">
                    ★ {dentist.rating} Rating
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-5 flex-grow text-left flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base sm:text-lg text-[#0F172A] font-display">
                      {dentist.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#2563EB]">
                      {dentist.role}
                    </p>
                    <p className="text-xs text-[#64748B] line-clamp-1">
                      Edu: {dentist.education}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-1">
                      {dentist.availableDays.map((day) => (
                        <span key={day} className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-105 px-1.5 py-0.5 rounded">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking Trigger link */}
                  <button
                    onClick={() => triggerBooking('', dentist.id)}
                    className="w-full py-2.5 bg-[#F8FAFC] hover:bg-[#2563EB] text-[#0F172A] hover:text-white font-semibold rounded-full text-xs transition-colors border border-slate-200 mt-2 flex items-center justify-center gap-1.5 duration-200"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
                    <span>Reserve Checked Slot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 8. TESTING / PATIENT REVIEW CAROUSEL */}
      <section id="reviews" className="py-20 bg-[#F8FAFC] border-t border-b border-[#E2E8F0] px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header titles */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Patient Trust
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
              What Our Patients Say
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Discover why over 5,000+ local families rate DentalDemoByNabin as their preferred family dental studio.
            </p>
          </div>

          {/* Testimonial slider component */}
          <ReviewCarousel />

        </div>
      </section>


      {/* 9. INTERACTIVE FAQ SECTION (ACCORDION) */}
      <section id="faq" className="py-20 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header titles */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Patient Help desk
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
              Common Clinical FAQs
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Everything you need to know about dental hygiene, treatment schedules, and dental insurances.
            </p>
          </div>

          {/* Accordion FAQ selector */}
          <FAQAccordion />

        </div>
      </section>


      {/* 10. APPOINTMENT CTA BANNER (BLUE BACKGROUND) */}
      <section className="py-16 bg-[#2563EB] text-white overflow-hidden relative px-6 sm:px-8">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-2xl opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/[0.15] px-4 py-1.5 rounded-full inline-block">
            Immediate Openings
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display leading-tight">
            Ready For A Healthier Smile?
          </h2>
          <p className="text-sm sm:text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
            Schedule your professional diagnosis consultation online today and smile with absolute assurance.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              id="cta-bottom-banner"
              onClick={() => triggerBooking()}
              className="px-8 py-3.5 bg-white text-[#2563EB] font-bold rounded-full text-base hover:opacity-95 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group transform active:scale-98"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-5 h-5 text-[#2563EB] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>


      {/* 11. CONTACT & FORMS SECTION */}
      <section id="contact" className="py-20 bg-white px-6 sm:px-8 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] tracking-tight">
              Contact Our Friendly Clinic
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Submit an online dental query below or call directly to speak with our receptionist.
            </p>
          </div>

          {/* Two Columns Grid Contact Sheet & details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
            
            {/* Left side column: Clinic Information */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-[#0F172A]">Clinic Information</h3>
                <p className="text-sm text-[#64748B]">Professional Medical Suites, Blue Hills District</p>
              </div>

              {/* Grid details block */}
              <div className="space-y-6">
                
                {/* Block 1 */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                    <MapPin className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">Clinic Address</h4>
                    <p className="text-sm text-[#64748B] mt-1">
                      452 Medical Center Parkway, Suite 104, <br />
                      Blue Hills Metro, NY 10022
                    </p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                    <Phone className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">Call Information</h4>
                    <p className="text-sm text-[#64748B] mt-1">
                      Direct: +1 (555) 019-9222 <br />
                      Emergency Desk: +1 (555) 019-9220
                    </p>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                    <Mail className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">Email Contacts</h4>
                    <p className="text-sm text-[#64748B] mt-1">
                      reception@dentaldemonabin.com <br />
                      billing@dentaldemonabin.com
                    </p>
                  </div>
                </div>

                {/* Block 4 */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                    <Clock className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">Opening Hours</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-[#64748B] mt-1 max-w-xs font-semibold">
                      <span>Monday – Friday:</span>
                      <span className="text-[#0F172A]">9:00 AM – 7:00 PM</span>
                      <span>Saturday:</span>
                      <span className="text-[#0F172A]">10:00 AM – 5:00 PM</span>
                      <span>Sunday:</span>
                      <span className="text-red-500">Closed</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right side column: Contact Form Sheets */}
            <div className="lg:col-span-7 bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm text-left">
              <h3 className="text-xl font-bold font-display text-[#0F172A] mb-2">Send Dental Message</h3>
              <p className="text-xs text-[#64748B] mb-6">Ask diagnostic queries, verify insurance networks, or ask about specific service requirements.</p>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g., Jessica Smith"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="E.g., (123) 456-7890"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="E.g., jessica@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Interest Service Category</label>
                  <select 
                    id="contact-select-service"
                    required
                    value={contactForm.service}
                    onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                  >
                    <option value="">-- Click to select query category --</option>
                    <option value="General Checkup">General Dentistry</option>
                    <option value="Cosmetics">Cosmetic Veneers</option>
                    <option value="Invisalign">Orthodontic therapy</option>
                    <option value="Emergency Toothache">Family Dental Emergency</option>
                    <option value="Billing Insurance">Billing & PPO Insurances</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Describe Message</label>
                  <textarea 
                    placeholder="Provide details about your query here..."
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                  ></textarea>
                </div>

                {contactSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold animate-fadeIn">
                    ✓ Dental message submitted! Our reception desk coordinator will reply via email shortly.
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#2563EB] hover:opacity-90 text-white font-bold rounded-full text-xs sm:text-sm transition-colors shadow-lg shadow-blue-50"
                  >
                    Send Clinic Message
                  </button>
                </div>

              </form>
            </div>

          </div>

          <div className="border-t border-[#E2E8F0] pt-12">
            <h3 className="text-lg font-bold font-display text-[#0F172A] mb-5 text-left">Clinic Neighborhood Boundaries</h3>
            {/* Interactive Clinic Map Segment */}
            <ClinicMap />
          </div>

        </div>
      </section>


      {/* 12. SERVICES DETAILS HIGHLIGHT POPUP MODAL */}
      {selectedServiceDetail && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative text-left">
            <button 
              onClick={() => setSelectedServiceDetail(null)}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md">
                Treatment Services Breakdown
              </span>
              <h3 className="text-xl font-bold font-display text-[#0F172A]">
                {selectedServiceDetail.name}
              </h3>
              
              <p className="text-sm text-[#64748B] leading-relaxed">
                {selectedServiceDetail.longDescription}
              </p>

              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-100 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block font-normal text-[10px] uppercase">Service Category</span>
                  <span className="text-[#0F172A]">{selectedServiceDetail.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal text-[10px] uppercase">Average Duration</span>
                  <span className="text-[#0F172A]">{selectedServiceDetail.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal text-[10px] uppercase">Approx Price Range</span>
                  <span className="text-green-600 font-bold">{selectedServiceDetail.priceEstimate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal text-[10px] uppercase">Clinical Treatment ID</span>
                  <span className="text-slate-500 font-mono">#{selectedServiceDetail.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-450 block">Treatment Benefits:</span>
                <ul className="space-y-1.5 text-xs text-[#64748B]">
                  {selectedServiceDetail.benefits.map((ben, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      {ben}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setSelectedServiceDetail(null)}
                  className="w-1/2 py-2.5 rounded-full text-xs font-semibold border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] transition-colors"
                >
                  Close Windows
                </button>
                <button 
                  onClick={() => {
                    const id = selectedServiceDetail.id;
                    setSelectedServiceDetail(null);
                    triggerBooking(id);
                  }}
                  className="w-1/2 py-2.5 rounded-full text-xs font-bold text-white bg-[#2563EB] hover:opacity-95 transition-colors shadow-md"
                >
                  Book This Treatment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 13. BOOKING PORTAL MODAL DIALOG */}
      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultServiceId={presetService}
        defaultDentistId={presetDentist}
      />

      {/* 13.5. CLINIC OFFICE CONTROL CENTER (ADMIN PORTAL) */}
      <AdminPortal 
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />


      {/* 14. COMPREHENSIVE FOOTER */}
      <footer className="bg-[#0F172A] text-slate-450 py-16 border-t-4 border-[#2563EB] px-6 sm:px-8 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Col 1: Brand details */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-[#2563EB] text-white rounded-lg">
                <Smile className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display text-white tracking-tight">
                DentalDemoByNabin
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Providing premium patient-centered orthodontics, micro-dentistry, and implant treatments in a professional sterile parlor. Accredited ADA medical provider.
            </p>

            <p className="text-[11px] text-slate-500 font-mono">
              ADA Lic No: #2884-X-NYAA
            </p>
          </div>

          {/* Col 2: Treatment Quick links */}
          <div className="col-span-1 md:col-span-3 space-y-4 text-xs">
            <h4 className="text-sm font-bold font-display text-white">Our Dental Services</h4>
            <div className="flex flex-col gap-2 font-medium">
              <button onClick={() => triggerBooking('general')} className="hover:text-[#2563EB] text-left transition-colors text-slate-400">General Checkups & Plaque Cleaning</button>
              <button onClick={() => triggerBooking('cosmetic')} className="hover:text-[#2563EB] text-left transition-colors text-slate-400">Porcelain Veneers Styling</button>
              <button onClick={() => triggerBooking('ortho')} className="hover:text-[#2563EB] text-left transition-colors text-slate-400">Invisalign Clear Aligners</button>
              <button onClick={() => triggerBooking('implants')} className="hover:text-[#2563EB] text-left transition-colors text-slate-400">Titanium Aesthetic Dental Implants</button>
              <button onClick={() => triggerBooking('whitening')} className="hover:text-[#2563EB] text-left transition-colors text-slate-400">Clinical Laser Enamel Whitening</button>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="col-span-1 md:col-span-2 space-y-4 text-xs text-slate-400">
            <h4 className="text-sm font-bold font-display text-white">Quick Nav Links</h4>
            <ul className="flex flex-col gap-2 font-medium">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services Info</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Smile Transformations</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Patient Stories</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Help FAQ</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Address</a></li>
            </ul>
          </div>

          {/* Col 4: Reach details */}
          <div className="md:col-span-3 space-y-4 text-xs">
            <h4 className="text-sm font-bold font-display text-white text-left">Clinical Support</h4>
            <p className="text-slate-400 leading-relaxed text-left">
              Have sudden pulsing dental pain or emergency chips? Reach our dentist coordinator immediately.
            </p>
            <div className="space-y-1 text-left font-bold text-white">
              <a href="tel:+15550199222" className="flex items-center gap-1.5 hover:text-blue-400">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>+1 (555) 019-9222</span>
              </a>
              <p className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[10px] text-slate-400 font-normal">Emergency Desk operates 24/7</span>
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[10px] sm:text-xs">
          <p>© 2026 DentalDemoByNabin. All Rights Reserved. Accredited Dental Clinic Agency.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer select-none">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer select-none">Terms of Dental Care</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Low-profile helper local SVG components to keep imports clean
function SettingsShieldIcon() {
  return (
    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function BellRingingIcon() {
  return (
    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
