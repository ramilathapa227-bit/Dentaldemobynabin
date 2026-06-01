import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Shield, Calendar, User, Clock, Check, Trash2, Plus, 
  Search, Mail, Phone, LogOut, Filter, MessageSquare, PlusCircle, 
  Smile, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { SERVICES_DATA, DENTISTS_DATA } from '../data';
import { Appointment, ContactMessage } from '../types';
import { 
  collection, doc, setDoc, getDocs, deleteDoc, query, orderBy 
} from 'firebase/firestore';
import { 
  db, auth, loginAdminWithEmail, logoutUser, handleFirestoreError, OperationType 
} from '../firebase';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPortal({ isOpen, onClose }: AdminPortalProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'messages'>('bookings');

  // Bookings list state
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dentistFilter, setDentistFilter] = useState('all');

  // New booking form state (Admin scheduling)
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState('');
  const [formDentistId, setFormDentistId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTimeSlot, setFormTimeSlot] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Load state from localStorage on init if persistent admin session is active
  useEffect(() => {
    const isAuthed = localStorage.getItem('is_dental_admin_logged_in') === 'true';
    if (isAuthed) {
      setIsAdminLoggedIn(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAdminLoggedIn && isOpen) {
      loadAdminData();
    }
  }, [isAdminLoggedIn, isOpen]);

  const loadAdminData = async () => {
    setSyncing(true);
    // 1. Initial fallbacks from local databases
    try {
      const storedBookings = localStorage.getItem('dental_bookings_nabin');
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
      const storedInquiries = localStorage.getItem('dental_contact_messages');
      if (storedInquiries) {
        setMessages(JSON.parse(storedInquiries));
      }
    } catch (e) {
      console.warn("Could not load local cached data:", e);
    }

    // 2. Querying live from Firestore
    try {
      console.log("Admin querying live bookings in real time...");
      const bookingsCol = collection(db, 'bookings');
      const bSnap = await getDocs(bookingsCol);
      const fbBookings: Appointment[] = [];
      bSnap.forEach(d => {
        fbBookings.push(d.data() as Appointment);
      });

      // Sort by creation date descending
      fbBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(fbBookings);
      localStorage.setItem('dental_bookings_nabin', JSON.stringify(fbBookings));
    } catch (err) {
      console.warn("Could not retrieve online bookings, permissions checked or off-grid:", err);
    }

    try {
      console.log("Admin querying live messages...");
      const msgsCol = collection(db, 'messages');
      const mSnap = await getDocs(msgsCol);
      const fbMessages: ContactMessage[] = [];
      mSnap.forEach(d => {
        fbMessages.push(d.data() as ContactMessage);
      });

      fbMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(fbMessages);
      localStorage.setItem('dental_contact_messages', JSON.stringify(fbMessages));
    } catch (err) {
      console.warn("Could not retrieve online messages:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    if (adminEmail === 'nabin123thapa4@gmail.com' && adminPassword === '8848') {
      try {
        const result = await loginAdminWithEmail(adminEmail, adminPassword);
        setIsAdminLoggedIn(true);
        localStorage.setItem('is_dental_admin_logged_in', 'true');
        console.log("Admin logged in successfully!", result);
      } catch (err: any) {
        setAuthError(err.message || 'Authentication issue occurred');
      } finally {
        setLoading(false);
      }
    } else {
      setAuthError('Incorrect clinical credentials. Enter matching admin details.');
      setLoading(false);
    }
  };

  const handleAdminSignOut = async () => {
    if (confirm("Are you sure you would like to sign out from the Dental Admin Portal?")) {
      setLoading(true);
      try {
        await logoutUser();
      } catch (e) {
        console.warn("Firebase Auth sign out failure, clearing local credentials regardless:", e);
      }
      setIsAdminLoggedIn(false);
      localStorage.removeItem('is_dental_admin_logged_in');
      setAdminEmail('');
      setAdminPassword('');
      setLoading(false);
    }
  };

  // Change booking status (Confirm or Cancel)
  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'canceled') => {
    setLoading(true);
    // 1. Locally update first
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('dental_bookings_nabin', JSON.stringify(updated));

    // 2. Synchronize to Firestore
    try {
      const target = bookings.find(b => b.id === bookingId);
      if (target) {
        const docRef = doc(db, 'bookings', bookingId);
        const updatedObj = { ...target, status: newStatus };
        await setDoc(docRef, updatedObj);
        console.log(`Document ${bookingId} status securely set to ${newStatus}`);
      }
    } catch (err) {
      console.error("Firestore status modification failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
      } catch (logErr) {}
    } finally {
      setLoading(false);
    }
  };

  // Complete removal of booking
  const deleteBookingRecord = async (bookingId: string) => {
    if (confirm("Are you sure you want to permanently delete this patient booking record from the databases? This action is irreversible.")) {
      setLoading(true);
      // 1. Update local UI lists
      const updated = bookings.filter(b => b.id !== bookingId);
      setBookings(updated);
      localStorage.setItem('dental_bookings_nabin', JSON.stringify(updated));

      // 2. Trigger Firestore Delete
      try {
        const docRef = doc(db, 'bookings', bookingId);
        await deleteDoc(docRef);
        console.log(`Successfully completed deletion of booking doc id: ${bookingId}`);
      } catch (err) {
        console.error("Firestore delete query failed:", err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `bookings/${bookingId}`);
        } catch (logErr) {}
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete message submission
  const deleteMessageRecord = async (msgId: string) => {
    if (confirm("Delete this patient contact submission review?")) {
      setLoading(true);
      const updated = messages.filter(m => m.id !== msgId);
      setMessages(updated);
      localStorage.setItem('dental_contact_messages', JSON.stringify(updated));

      try {
        const docRef = doc(db, 'messages', msgId);
        await deleteDoc(docRef);
        console.log("Contact submission record cleared.");
      } catch (err) {
        console.error("Firestore inquiry delete failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Create new booking from Admin End
  const handleAdminSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formName || !formEmail || !formPhone || !formServiceId || !formDentistId || !formDate || !formTimeSlot) {
      setFormError('All fields marked * are required to schedule an appointment from the admin console.');
      return;
    }

    setLoading(true);
    const appointmentId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      id: appointmentId,
      patientName: formName,
      patientEmail: formEmail,
      patientPhone: formPhone,
      serviceId: formServiceId,
      dentistId: formDentistId,
      date: formDate,
      timeSlot: formTimeSlot,
      notes: formNotes || 'Created by Administrator inside Admin Portal',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // 1. Try to push Live to Firestore
    try {
      const docRef = doc(db, 'bookings', appointmentId);
      await setDoc(docRef, newAppointment);
      console.log("Appointment scheduled securely on cloud Firestore.");
    } catch (err) {
      console.error("Admin firestore schema schedule error:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${appointmentId}`);
      } catch (logErr) {}
    }

    // 2. Always persist into Local database copy
    try {
      const stored = localStorage.getItem('dental_bookings_nabin');
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = [newAppointment, ...list];
      localStorage.setItem('dental_bookings_nabin', JSON.stringify(updatedList));
      setBookings(updatedList);

      // Clean form state variables
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormServiceId('');
      setFormDentistId('');
      setFormDate('');
      setFormTimeSlot('');
      setFormNotes('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 5000);
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper selectors
  const getServiceName = (id: string) => {
    const srv = SERVICES_DATA.find(s => s.id === id);
    return srv ? srv.name : 'Unknown Dental Procedure';
  };

  const getDentistName = (id: string) => {
    const den = DENTISTS_DATA.find(d => d.id === id);
    return den ? den.name : 'Assigned Doctor';
  };

  // Filtering lists
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.patientPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDentist = dentistFilter === 'all' || b.dentistId === dentistFilter;

    return matchesSearch && matchesStatus && matchesDentist;
  });

  // Calculate statistics totals
  const totalInquiries = messages.length;
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const canceledBookingsCount = bookings.filter(b => b.status === 'canceled').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 relative animate-fadeIn min-h-[480px]">
        
        {/* TOP COMPONENT HEADER BAR */}
        <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2563EB] text-white rounded-xl">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="font-bold sm:text-lg font-display tracking-tight text-white flex items-center gap-2">
                Clinical Admin Portal
                <span className="text-[10px] uppercase font-mono bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                  Verified Office End
                </span>
              </h2>
              <p className="text-[10.5px] text-slate-400">Dental clinic control panels, patient scheduling & messaging systems.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-all"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPONENT BODY */}
        {!isAdminLoggedIn ? (
          /* LOGIN FORM COMPONENT */
          <div className="p-8 pb-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-6">
            <div className="p-4 bg-blue-50 text-[#2563EB] rounded-full animate-pulse">
              <Lock className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-[#0F172A]">Clinical Office SignIn</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Enter your administrative credentials to check live scheduled dental chairs, manage treatment queues & diagnostic submissions.
              </p>
            </div>

            <form onSubmit={handleAdminSignIn} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] block">Clinic Admin Email</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g., admin@clinic.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] block">Secure Pin Code / Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-250 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2563EB] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Validating Clinic Desk...' : 'Unlock Administrative Console'}
              </button>
            </form>

            <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-2xl w-full text-[11px] text-[#64748B] text-left space-y-1 font-medium">
              <span className="text-[#0F172A] font-bold block mb-1">🔑 Quick Demo Credentials:</span>
              <p>Email: <span className="font-mono text-[#2563EB] select-all">nabin123thapa4@gmail.com</span></p>
              <p>Password: <span className="font-mono text-[#2563EB] select-all">8848</span></p>
            </div>
          </div>
        ) : (
          /* ADMINISTRATIVE DASHBOARD COMPONENT */
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* SIDE BAR / ACTIONS DRAWER */}
            <div className="w-full md:w-64 bg-[#F8FAFC] p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Navigation Menu</span>
                  <div className="mt-3 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all justify-start ${
                        activeTab === 'bookings'
                          ? 'bg-[#2563EB] text-white shadow-md'
                          : 'bg-white hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Manage Bookings</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 text-inherit">
                        {totalBookingsCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all justify-start ${
                        activeTab === 'messages'
                          ? 'bg-[#2563EB] text-white shadow-md'
                          : 'bg-white hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Patient Messages</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 text-inherit">
                        {totalInquiries}
                      </span>
                    </button>
                  </div>
                </div>

                {/* STATISTICS TICKER */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Beds & Chair Sync Info</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-left">
                      <span className="text-slate-400 text-[10px] uppercase block">Total</span>
                      <span className="text-[#011627] text-base font-bold">{totalBookingsCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-left">
                      <span className="text-green-500 text-[10px] uppercase block font-semibold">Confirmed</span>
                      <span className="text-[#011627] text-base font-bold">{activeBookingsCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-left">
                      <span className="text-amber-500 text-[10px] uppercase block font-semibold">Pending</span>
                      <span className="text-[#011627] text-base font-bold">{pendingBookingsCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-left">
                      <span className="text-red-500 text-[10px] uppercase block font-semibold">Canceled</span>
                      <span className="text-[#011627] text-base font-bold">{canceledBookingsCount}</span>
                    </div>
                  </div>
                </div>

                {/* QUICK DESK ACTIONS */}
                <div className="space-y-3 border-t border-slate-200/80 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Quick Actions</span>
                    <button 
                      onClick={loadAdminData}
                      disabled={syncing}
                      className="p-1 text-slate-400 hover:text-[#2563EB] disabled:opacity-55 transition-colors"
                      title="Sync Data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {activeTab === 'bookings' && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Booking</span>
                    </button>
                  )}
                </div>
              </div>

              {/* LOGOUT FOOTER */}
              <div className="border-t border-slate-200/80 pt-4">
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Admin Portal</span>
                </button>
              </div>

            </div>

            {/* MAIN DATA MODULE DISPLAY */}
            <div className="flex-1 p-6 flex flex-col space-y-6 max-h-[640px] overflow-y-auto">
              
              {/* DISPLAY CREATION DRAWER IF ACTIVE */}
              {showAddForm && activeTab === 'bookings' && (
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 animate-slideDown text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <PlusCircle className="w-4.5 h-4.5 text-emerald-600" />
                      Override Booking Form:
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="text-emerald-800 hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAdminSchedule} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Patient Name *</label>
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Patient Email *</label>
                      <input 
                        type="email"
                        required
                        placeholder="patient@gmail.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Patient Phone *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="123-456-7890"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Treatment Service *</label>
                      <select 
                        required
                        value={formServiceId}
                        onChange={(e) => setFormServiceId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-[#0F172A]"
                      >
                        <option value="">-- Choose Service --</option>
                        {SERVICES_DATA.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.priceEstimate})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Dentist In Charge *</label>
                      <select 
                        required
                        value={formDentistId}
                        onChange={(e) => setFormDentistId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-[#0F172A]"
                      >
                        <option value="">-- Choose Doctor --</option>
                        {DENTISTS_DATA.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Appointment Date *</label>
                      <input 
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#0F172A]">Select Time Slot *</label>
                      <select 
                        required
                        value={formTimeSlot}
                        onChange={(e) => setFormTimeSlot(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-[#0F172A]"
                      >
                        <option value="">-- Slot --</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-[#0F172A]">Admin Notes / Guidelines</label>
                      <input 
                        type="text"
                        placeholder="Special requirements, pre-op instructions, billing insurance, etc."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    {formError && (
                      <div className="col-span-full text-red-700 font-semibold">{formError}</div>
                    )}

                    <div className="col-span-full flex gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-350 text-slate-700 rounded-full font-semibold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-md"
                      >
                        Schedule Office Chair
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 1: BOOKING RECORDS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4 text-left">
                  
                  {/* SEARCH FILTERS BLOCK */}
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] flex flex-wrap gap-3 items-center justify-between">
                    <div className="relative w-full max-w-sm shrink-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="text"
                        placeholder="Search patient name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                      <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs text-[#64748B]">
                        <Filter className="w-3.5 h-3.5" />
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-transparent border-none text-[#0F172A] font-medium text-xs focus:outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs text-[#64748B]">
                        <User className="w-3.5 h-3.5" />
                        <select 
                          value={dentistFilter}
                          onChange={(e) => setDentistFilter(e.target.value)}
                          className="bg-transparent border-none text-[#0F172A] font-medium text-xs focus:outline-none"
                        >
                          <option value="all">All Doctors</option>
                          {DENTISTS_DATA.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* DATA GRID TABLE */}
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                    {filteredBookings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                            <tr>
                              <th className="px-4 py-3">Patient Detail</th>
                              <th className="px-4 py-3">Dentist / Service</th>
                              <th className="px-4 py-3">Schedule Time</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Office Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                            {filteredBookings.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4 space-y-0.5">
                                  <div className="font-bold text-[#0F172A] sm:text-sm">{b.patientName}</div>
                                  <div className="text-[#64748B] flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-[#2563EB]" />
                                    <span>{b.patientEmail}</span>
                                  </div>
                                  <div className="text-[#64748B] flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#2563EB]" />
                                    <span>{b.patientPhone}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 space-y-1">
                                  <div className="font-semibold text-[#0F172A]">{getServiceName(b.serviceId)}</div>
                                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                    Doctor: {getDentistName(b.dentistId)}
                                  </div>
                                  {b.notes && (
                                    <div className="text-[#64748B] italic max-w-xs truncate text-[10px]" title={b.notes}>
                                      "{b.notes}"
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 space-y-1">
                                  <div className="flex items-center gap-1 font-semibold text-[#0F172A]">
                                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                                    <span>{b.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[#64748B]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{b.timeSlot}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  {b.status === 'confirmed' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                                      <Check className="w-2.5 h-2.5" />
                                      Confirmed
                                    </span>
                                  )}
                                  {b.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                                      Pending
                                    </span>
                                  )}
                                  {b.status === 'canceled' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                      Canceled
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {b.status !== 'confirmed' && (
                                      <button 
                                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                        className="p-1 px-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 rounded-lg font-bold flex items-center gap-0.5"
                                        title="Confirm Booking"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Confirm</span>
                                      </button>
                                    )}

                                    {b.status !== 'canceled' && (
                                      <button 
                                        onClick={() => updateBookingStatus(b.id, 'canceled')}
                                        className="p-1 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 rounded-lg font-bold flex items-center gap-0.5"
                                        title="Cancel Booking"
                                      >
                                        <span>Cancel</span>
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => deleteBookingRecord(b.id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-lg"
                                      title="Delete Permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center space-y-2.5">
                        <FileText className="w-10 h-10 text-slate-350 mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-slate-700">No matching dental schedules found</p>
                        <p className="text-xs text-slate-400">Try adjusting your active query or dentists filters.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: PATIENT MESSAGES (Contact inquiries) */}
              {activeTab === 'messages' && (
                <div className="space-y-4 text-left">
                  
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] font-medium font-display leading-relaxed">
                      Below is the comprehensive register of digital messages and insurance verification requests submitted by patients using the landing page contact form.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((m) => (
                        <div key={m.id} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 items-start justify-between hover:bg-slate-50/20 transition-colors">
                          <div className="space-y-2 flex-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-[#0F172A] text-sm sm:text-base">{m.name}</h4>
                              <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-blue-50/80 px-2 py-0.5 rounded-full font-mono">
                                Type: {m.service}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-[#0F172A] bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 italic font-medium leading-relaxed">
                              "{m.message || 'No written diagnostic description.'}"
                            </p>

                            <div className="text-[11px] text-[#64748B] flex flex-wrap gap-x-4 gap-y-1 pt-1 font-semibold">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                                {m.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                                {m.phone}
                              </span>
                              <span className="text-slate-400">
                                Submitted: {new Date(m.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                            <a 
                              href={`mailto:${m.email}`} 
                              className="p-1 px-2.5 bg-[#2563EB] hover:opacity-95 text-white rounded-lg font-bold flex items-center gap-1 h-[30px]"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Reply</span>
                            </a>
                            <button 
                              onClick={() => deleteMessageRecord(m.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-lg h-[30px] flex items-center justify-center aspect-square"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-16 bg-white rounded-2xl border border-dashed border-[#E2E8F0] text-center space-y-2">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-slate-700">No clinical contact inquiries registered</p>
                        <p className="text-xs text-slate-400">Database matches are currently clear.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
