import React, { useState, useEffect } from 'react';
import { SERVICES_DATA, DENTISTS_DATA } from '../data';
import { Appointment } from '../types';
import { 
  X, Calendar, Clock, User, Sparkles, AlertCircle, CheckCircle2, 
  ChevronRight, CalendarCheck2, ShieldAlert, Phone, Mail, FileText, Trash2,
  LogIn, LogOut
} from 'lucide-react';
import { 
  collection, doc, setDoc, getDocs, getDoc, query, where, addDoc 
} from 'firebase/firestore';
import { 
  db, auth, handleFirestoreError, OperationType, loginWithGoogle, logoutUser 
} from '../firebase';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
  defaultDentistId?: string;
}

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  defaultServiceId = '', 
  defaultDentistId = '' 
}: AppointmentModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceId, setServiceId] = useState(defaultServiceId);
  const [dentistId, setDentistId] = useState(defaultDentistId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myBookings, setMyBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Track reactive auth state
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
      if (u) {
        setName(u.displayName || name || '');
        setEmail(u.email || email || '');
      }
    });
    return () => unsubscribe();
  }, []);

  // Time Slots
  const slots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  // Sync state with default props when they change or modal opens
  useEffect(() => {
    if (isOpen) {
      setServiceId(defaultServiceId);
      setDentistId(defaultDentistId);
      setStep(1);
      setBookingSuccess(null);
      setShowMyBookings(false);
      loadBookings();
    }
  }, [isOpen, defaultServiceId, defaultDentistId]);

  const loadBookings = async () => {
    setLoading(true);
    // 1. Instant fallback from localStorage
    try {
      const stored = localStorage.getItem('dental_bookings_nabin');
      if (stored) {
        setMyBookings(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Load live from Firestore as source of truth
    try {
      let q;
      if (auth.currentUser) {
        // Query matching userId OR patientEmail (for deep sync)
        console.log("Fetching live bookings for authenticated user:", auth.currentUser.email);
        q = query(
          collection(db, 'bookings'),
          where('patientEmail', '==', auth.currentUser.email)
        );
        const qSnapshot = await getDocs(q);
        const fbList: Appointment[] = [];
        qSnapshot.forEach((doc) => {
          fbList.push(doc.data() as Appointment);
        });

        // Filter out duplicates if any (by id)
        const localStored = localStorage.getItem('dental_bookings_nabin');
        const localList: Appointment[] = localStored ? JSON.parse(localStored) : [];
        const mergedMap = new Map<string, Appointment>();
        
        localList.forEach(item => mergedMap.set(item.id, item));
        fbList.forEach(item => mergedMap.set(item.id, item));
        
        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setMyBookings(mergedList);
        localStorage.setItem('dental_bookings_nabin', JSON.stringify(mergedList));
      }
    } catch (err) {
      console.warn("Could not retrieve online bookings, offline mode enabled:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceId || !dentistId || !date || !timeSlot || !name || !email || !phone) {
      alert('Please fill in all required dental details');
      return;
    }

    const appointmentId = `apt-${Date.now()}`;
    const newAppointment: Appointment & { userId?: string } = {
      id: appointmentId,
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      serviceId,
      dentistId,
      date,
      timeSlot,
      notes,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    if (auth.currentUser) {
      newAppointment.userId = auth.currentUser.uid;
    }

    setLoading(true);

    // 1. Try to write to Firestore
    let savedToFirestore = false;
    try {
      const docRef = doc(db, 'bookings', appointmentId);
      await setDoc(docRef, newAppointment);
      savedToFirestore = true;
      console.log("Booking successfully securely saved to Firestore!");
    } catch (err) {
      console.error("Firestore backup write failed", err);
      // Non-blocking fallback following the instruction guidelines:
      // If permission error, handle cleanly and report logs
      try {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${appointmentId}`);
      } catch (logErr) {
        // Log handled custom error block
      }
    }

    // 2. Always write to LocalStorage as a local robust fallback/cache
    try {
      const stored = localStorage.getItem('dental_bookings_nabin');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newAppointment, ...list];
      localStorage.setItem('dental_bookings_nabin', JSON.stringify(updated));
      setMyBookings(updated);
      setBookingSuccess(newAppointment);
      setStep(2);
      
      // Clear form inputs
      setDate('');
      setTimeSlot('');
      setName(currentUser ? currentUser.displayName || '' : '');
      setEmail(currentUser ? currentUser.email || '' : '');
      setPhone('');
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (confirm('Are you sure you would like to cancel your scheduled dental appointment?')) {
      setLoading(true);
      
      // 1. Try to cancel on Firestore by updating the status key to 'cancelled'
      try {
        const docRef = doc(db, 'bookings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data() as Appointment;
          const updatedObj = { ...currentData, status: 'cancelled' };
          await setDoc(docRef, updatedObj);
          console.log("Firestore status updated to cancelled.");
        }
      } catch (err) {
        console.error("Could not cancel online booking, reverting changes locally:", err);
        try {
          handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
        } catch (logErr) {}
      }

      // 2. Sync locally
      const updated = myBookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
      localStorage.setItem('dental_bookings_nabin', JSON.stringify(updated));
      setMyBookings(updated);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedService = SERVICES_DATA.find(s => s.id === serviceId);
  const selectedDentist = DENTISTS_DATA.find(d => d.id === dentistId);

  return (
    <div id="appointment-portal" className="fixed inset-0 z-50 overflow-y-auto bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-[#E2E8F0] transform transition-all duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-[#2563EB] text-white p-6 relative">
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-1.5 pr-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">
              DENTAL DEMO CLINIC
            </span>
            <h3 className="text-2xl font-bold font-display">
              {showMyBookings ? 'Your Patient Consultations' : 'Schedule Dental Appointment'}
            </h3>
            <p className="text-sm text-blue-100">
              {showMyBookings 
                ? 'Review and manage your scheduled clinic consultations' 
                : 'Select treatments, choose specialists, and secure your time slot instantly'
              }
            </p>
          </div>

          {/* Quick toggle top action */}
          <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMyBookings(false);
                  setStep(1);
                  setBookingSuccess(null);
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                  !showMyBookings 
                    ? 'bg-white text-[#2563EB]' 
                    : 'bg-[#2563EB] text-white hover:opacity-90 border border-blue-300'
                }`}
              >
                Book Appointment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMyBookings(true);
                  loadBookings();
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  showMyBookings 
                    ? 'bg-white text-[#2563EB]' 
                    : 'bg-[#2563EB] text-white hover:opacity-90 border border-blue-300'
                }`}
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                Manage Bookings ({myBookings.length})
              </button>
            </div>

            {/* Google Authentication Status */}
            <div className="text-xs">
              {currentUser ? (
                <div id="google-user-profile" className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'Patient'} 
                      className="w-4.5 h-4.5 rounded-full" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-4.5 h-4.5 bg-white/25 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {currentUser.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate font-medium text-white/90">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button 
                    type="button" 
                    onClick={async () => {
                      if(confirm("Sign out of your Patient Google Account?")) {
                        await logoutUser();
                        loadBookings();
                      }
                    }} 
                    className="hover:text-red-300 text-white/80 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                      loadBookings();
                    } catch (e) {
                      console.error("Google sign in issue:", e);
                      alert("Could not complete Google Sign-In. Please check your config status.");
                    }
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-950 px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-sm transition-all text-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Sync Google Account</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {showMyBookings ? (
            /* SECTION: MANAGE PREVIOUS BOOKINGS */
            <div className="space-y-5">
              {myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((b) => {
                    const serv = SERVICES_DATA.find(s => s.id === b.serviceId);
                    const dent = DENTISTS_DATA.find(d => d.id === b.dentistId);
                    return (
                      <div 
                        key={b.id} 
                        className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              ✓ {b.status}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              ID: {b.id}
                            </span>
                          </div>
                          
                          <h4 className="text-base font-bold text-[#0F172A]">
                            {serv?.name || 'General Dental Treatment'}
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#64748B]">
                            <p className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#2563EB]" /> {dent?.name || 'Available Dentist'}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> {b.date}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> {b.timeSlot}
                            </p>
                            <p className="flex items-center gap-1.5 md:col-span-2 capitalize">
                              👤 Patient: {b.patientName} ({b.patientPhone})
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => cancelBooking(b.id)}
                          className="px-4 py-2 text-xs font-semibold rounded-full text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1.5 border border-red-100 self-start sm:self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancel Appt
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-2xl space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-[#0F172A]">No Active Dental Bookings Found</p>
                  <p className="text-xs text-[#64748B]">Schedule your custom tooth examination using the "Book Appointment" tab above.</p>
                </div>
              )}
            </div>
          ) : bookingSuccess ? (
            /* SECTION: CONFIRMATION INVOICE RECEIPT */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#0F172A] font-display">Dental Care Confirmed!</h4>
                <p className="text-sm text-[#64748B]">Your appointment reservation codes have been secured below.</p>
              </div>

              {/* Patient Receipt Panel */}
              <div className="border border-green-200 bg-green-50/[0.15] rounded-3xl p-6 text-left max-w-md mx-auto space-y-4">
                <div className="space-y-1 pb-3 border-b border-dashed border-green-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#2563EB] tracking-wider uppercase">DENTAL RECONSTRUCTIVE CARD</span>
                    <span className="font-mono text-slate-500 font-semibold">{bookingSuccess.id}</span>
                  </div>
                  <h5 className="text-base font-bold text-[#0F172A] mt-1">
                    {selectedService?.name || 'General Dental Treatment'}
                  </h5>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[#64748B]">Specialist Dentist</span>
                    <p className="font-semibold text-[#0F172A]">{selectedDentist?.name || 'Doctor Dentist'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#64748B]">Consultation Fee</span>
                    <p className="font-semibold text-green-600">{selectedService?.priceEstimate || 'Insurance Covered'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#64748B]">Scheduled Date</span>
                    <p className="font-semibold text-[#0F172A]">{bookingSuccess.date}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#64748B]">Assigned Time</span>
                    <p className="font-semibold text-[#0F172A]">{bookingSuccess.timeSlot}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[#64748B]">Registered Patient</span>
                    <p className="font-semibold text-[#0F172A]">
                      {bookingSuccess.patientName} ({bookingSuccess.patientPhone})
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-150 flex items-start gap-2.5 text-[11px] text-[#64748B]">
                  <AlertCircle className="w-4.5 h-4.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <p>
                    Please arrive 10 minutes prior to your checkup. Feel free to contact our coordinator if you need to reschedule.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm bg-[#0F172A] hover:opacity-90 text-white font-semibold rounded-full transition-colors shadow-sm"
                >
                  Done, Go to Website
                </button>
              </div>

            </div>
          ) : (
            /* SECTION: MULTI-STEP APPOINTMENT SHEETS FORM */
            <form onSubmit={handleBooking} className="space-y-6">
              
              {/* Progress Stepper bar */}
              <div className="flex items-center gap-2 pb-2">
                <div className={`p-1 px-3 rounded text-xs font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700'}`}>
                  {step === 1 ? '1. Treatment Details' : '✓ 1. Treatment Details'}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className={`p-1 px-3 rounded text-xs font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  2. Patient Contact Information
                </div>
              </div>

              {step === 1 ? (
                /* STEP 1: Treatment, Dentist, Date, Time */
                <div className="space-y-4">
                  
                  {/* Service dropdown selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Select Treatment Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="form-select-service"
                      required
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
                    >
                      <option value="">-- Click to choose a dental treatment --</option>
                      {SERVICES_DATA.map((serv) => (
                        <option key={serv.id} value={serv.id}>
                          {serv.name} ({serv.category}) — Est: {serv.priceEstimate}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dentist specialist selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#2563EB]" /> Choose Specialist Dentist <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DENTISTS_DATA.map((dent) => (
                        <div
                          key={dent.id}
                          id={`select-dentist-card-${dent.id}`}
                          onClick={() => setDentistId(dent.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            dentistId === dent.id
                              ? 'border-[#2563EB] bg-[#2563EB]/[0.03]'
                              : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                          }`}
                        >
                          <img
                            src={dent.imageUrl}
                            alt={dent.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left leading-tight">
                            <p className="text-xs font-bold text-[#0F172A]">{dent.name}</p>
                            <p className="text-[10px] text-[#64748B] mt-0.5">{dent.specialty}</p>
                            <p className="text-[9px] text-[#2563EB] font-bold mt-1 uppercase">★ {dent.rating} rating</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date and Time slots selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Pick Treatment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        min={new Date().toISOString().split('T')[0]} // prevent booking in the past
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Pick Hour Slot <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="form-select-slot"
                        required
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                      >
                        <option value="">-- Choose Time --</option>
                        {slots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!serviceId || !dentistId || !date || !timeSlot}
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-full font-semibold text-sm bg-[#2563EB] text-white hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1 shadow-md"
                    >
                      Continue to Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: Patient Registration Information */
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Full Patient Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="E.g., Jessica Smith"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Mobile Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="E.g., (123) 456-7890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="E.g., jessica@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Additional Treatment Notes <span className="text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      placeholder="Mention any dental sensitivities, medical alerts, or scheduling preferences..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                    ></textarea>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-xs text-[#64748B] space-y-1 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#0F172A]">Summary Plan:</p>
                      <p>{selectedService?.name} with {selectedDentist?.name}</p>
                      <p className="font-medium text-[#2563EB] mt-0.5">{date} at {timeSlot}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        Est: {selectedService?.priceEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Submit and Back button */}
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold border border-[#E2E8F0] hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2563EB] hover:opacity-95 transition-colors shadow-lg shadow-blue-100 flex items-center gap-1.5"
                    >
                      ✓ Confirm Reservation Check
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
