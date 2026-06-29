"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Car, 
  Users, 
  CreditCard, 
  Settings as SettingsIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  LogOut, 
  Sparkles,
  Ticket,
  MessageSquare,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Tab state: 'stats' | 'calendar' | 'bookings' | 'customers' | 'services' | 'payments' | 'settings' | 'promotions' | 'reviews'
  const [activeTab, setActiveTab] = useState('stats');
  
  // Data loading states
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal / Form states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // New Booking Form States
  const [newBDate, setNewBDate] = useState('');
  const [newBTime, setNewBTime] = useState('09:00');
  const [newBService, setNewBService] = useState('');
  const [newBCustName, setNewBCustName] = useState('');
  const [newBCustPhone, setNewBCustPhone] = useState('');
  const [newBCustPlate, setNewBCustPlate] = useState('');
  const [newBCustVehicle, setNewBCustVehicle] = useState('Sedan');
  const [newBPayment, setNewBPayment] = useState('Efectivo');
  const [newBObs, setNewBObs] = useState('');

  // New Service Form States
  const [newSName, setNewSName] = useState('');
  const [newSDesc, setNewSDesc] = useState('');
  const [newSPrice, setNewSPrice] = useState('');
  const [newSDuration, setNewSDuration] = useState('60');
  const [newSIncludes, setNewSIncludes] = useState('');
  const [newSImage, setNewSImage] = useState('');

  // New Promotion Form States
  const [newPCode, setNewPCode] = useState('');
  const [newPDesc, setNewPDesc] = useState('');
  const [newPDiscount, setNewPDiscount] = useState('10');
  const [newPExpiry, setNewPExpiry] = useState('');

  // Calendar View mode: 'day' | 'week' | 'month'
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  // Auth checking
  useEffect(() => {
    const token = localStorage.getItem('detailing_admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAdmin(true);
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const st = await api.getStats();
      setStats(st);
      
      const bk = await api.getBookings();
      setBookings(bk);

      const cust = await api.getCustomers();
      setCustomers(cust);

      const srv = await api.getAdminServices();
      setServices(srv);

      const pay = await api.getPayments();
      setPayments(pay);

      const set = await api.getSettings();
      setSettings(set);

      const promo = await api.getPromotions();
      setPromotions(promo);

      const rev = await api.getAdminReviews();
      setReviews(rev);
    } catch (e) {
      console.error("Error loading admin dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push('/admin/login');
  };

  // Status Color Code Helpers
  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30';
      case 'Confirmado':
        return 'bg-brand-green/15 text-brand-green border border-brand-green/30';
      case 'Finalizado':
        return 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30';
      case 'Cancelado':
        return 'bg-dark-muted/15 text-dark-muted border border-dark-border';
      default:
        return 'bg-dark-card border border-dark-border text-white';
    }
  };

  // Manage Bookings operations
  const handleUpdateBookingStatus = async (id: string, bookingStatus: string, paymentStatus?: string) => {
    try {
      await api.updateBooking(id, { bookingStatus, paymentStatus });
      loadAllData();
    } catch (e) {
      alert("Error al actualizar reserva.");
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBDate || !newBTime || !newBService || !newBCustName || !newBCustPhone || !newBCustPlate) {
      alert("Completá todos los campos requeridos.");
      return;
    }

    try {
      await api.createBooking({
        date: newBDate,
        startTime: newBTime,
        serviceId: newBService,
        customerName: newBCustName,
        customerPhone: newBCustPhone,
        vehiclePlate: newBCustPlate.toUpperCase(),
        vehicleType: newBCustVehicle,
        paymentMethod: newBPayment,
        observations: newBObs
      });
      setShowBookingModal(false);
      resetBookingForm();
      loadAllData();
    } catch (e: any) {
      alert("Error al crear reserva. Verificar colisión de horarios.");
    }
  };

  const resetBookingForm = () => {
    setNewBDate('');
    setNewBTime('09:00');
    setNewBService('');
    setNewBCustName('');
    setNewBCustPhone('');
    setNewBCustPlate('');
    setNewBObs('');
  };

  // Manage Services operations
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName || !newSPrice || !newSDuration) return;
    
    try {
      const includesArr = newSIncludes.split(',').map(i => i.trim()).filter(Boolean);
      await api.createService({
        name: newSName,
        description: newSDesc,
        price: parseFloat(newSPrice),
        durationMinutes: parseInt(newSDuration),
        includes: includesArr,
        imageUrl: newSImage || undefined
      });
      setShowServiceModal(false);
      resetServiceForm();
      loadAllData();
    } catch (e) {
      alert("Error al crear servicio.");
    }
  };

  const resetServiceForm = () => {
    setNewSName('');
    setNewSDesc('');
    setNewSPrice('');
    setNewSDuration('60');
    setNewSIncludes('');
    setNewSImage('');
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar o desactivar este servicio?")) return;
    try {
      await api.deleteService(id);
      loadAllData();
    } catch (e) {
      alert("Error al borrar servicio.");
    }
  };

  // Manage Promotions
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPCode || !newPDiscount) return;

    try {
      const db = localStorage.getItem('detailing_mock_db_2026');
      const parsed = db ? JSON.parse(db) : { promotions: [] };
      const newPromo = {
        id: `pr-${Math.random().toString(36).substr(2, 9)}`,
        code: newPCode.toUpperCase(),
        description: newPDesc,
        discountPercent: parseFloat(newPDiscount),
        active: true,
        expiryDate: newPExpiry || null
      };
      parsed.promotions.push(newPromo);
      localStorage.setItem('detailing_mock_db_2026', JSON.stringify(parsed));
      
      setShowPromoModal(false);
      setNewPCode('');
      setNewPDesc('');
      setNewPDiscount('10');
      setNewPExpiry('');
      loadAllData();
    } catch (e) {
      alert("Error al guardar cupón.");
    }
  };

  // Block schedules & Settings update
  const handleUpdateSettings = async (key: string, value: any) => {
    try {
      const payload = { [key]: value };
      await api.saveSettings(payload);
      loadAllData();
    } catch (e) {
      alert("Error al guardar configuraciones.");
    }
  };

  // Review status
  const handleToggleReviewApproval = async (id: string, approved: boolean) => {
    try {
      await api.approveReview(id, approved);
      loadAllData();
    } catch (e) {
      console.error(e);
      alert("Error al cambiar el estado de la opinión.");
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-dark-muted">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-dark-border">
        <div>
          <span className="text-xs text-brand-orange font-bold uppercase tracking-wider">Centro de Control</span>
          <h1 className="text-3xl font-extrabold font-display text-white mt-1">Panel de Control General</h1>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={loadAllData}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-dark-border text-white hover:bg-dark-card transition-all"
          >
            🔄 Actualizar Datos
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-dark-border/40">
        {[
          { id: 'stats', label: '📊 Estadísticas', desc: 'KPIs del negocio' },
          { id: 'calendar', label: '📅 Calendario Agenda', desc: 'Vista de turnos de colores' },
          { id: 'bookings', label: '🚗 Gestión Turnos', desc: 'Control de reservas' },
          { id: 'customers', label: '👥 Historial Clientes', desc: 'Fidelización y visitas' },
          { id: 'services', label: '🛠️ Servicios', desc: 'Duraciones y precios' },
          { id: 'payments', label: '💳 Finanzas & Pagos', desc: 'Estado de facturación' },
          { id: 'settings', label: '⚙️ Horarios y Bloqueos', desc: 'Días, descansos y vacaciones' },
          { id: 'promotions', label: '🎟️ Cupones / Promos', desc: 'Descuentos y packs' },
          { id: 'reviews', label: '💬 Reseñas', desc: 'Aprobación de opiniones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all border ${
              activeTab === tab.id
                ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow'
                : 'bg-dark-card border-dark-border/60 text-dark-muted hover:text-white hover:border-dark-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. STATS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* Main KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Turnos Hoy</span>
              <h3 className="text-3xl font-black text-white mt-2 font-display">{stats.bookingsToday}</h3>
              <p className="text-[11px] text-brand-blue mt-1">Vehículos programados</p>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Turnos de la Semana</span>
              <h3 className="text-3xl font-black text-white mt-2 font-display">{stats.bookingsWeek}</h3>
              <p className="text-[11px] text-brand-orange mt-1">Total reservas activas</p>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Clientes Totales</span>
              <h3 className="text-3xl font-black text-white mt-2 font-display">{stats.totalCustomers}</h3>
              <p className="text-[11px] text-brand-green mt-1">Clientes registrados</p>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Ingresos Hoy</span>
              <h3 className="text-3xl font-black text-brand-green mt-2 font-display">${stats.earningsToday.toLocaleString('es-AR')}</h3>
              <p className="text-[11px] text-dark-muted mt-1">Cobrado en caja</p>
            </div>
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Ingresos del Mes</span>
              <h3 className="text-3xl font-black text-brand-blue mt-2 font-display">${stats.earningsMonth.toLocaleString('es-AR')}</h3>
              <p className="text-[11px] text-dark-muted mt-1">Mes actual</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service popularity card */}
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                🏆 Servicio Más Solicitado
              </h4>
              <div className="p-6 rounded-xl bg-dark-bg border border-dark-border/40 text-center space-y-2">
                <h5 className="text-lg font-bold text-brand-orange">{stats.popularService?.name || 'Lavado Premium'}</h5>
                <p className="text-xs text-dark-muted">Servicios ejecutados este mes: {stats.popularService?.count || 12}</p>
              </div>
            </div>

            {/* Top Customers card */}
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                ⭐️ Clientes Frecuentes (Mayor Gasto)
              </h4>
              <div className="space-y-3">
                {stats.frequentCustomers.map((cust: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl">
                    <div>
                      <h5 className="text-xs font-bold text-white">{cust.name}</h5>
                      <span className="text-[10px] text-dark-muted">Puntos de fidelidad: {cust.loyaltyPoints}</span>
                    </div>
                    <span className="text-xs font-extrabold text-brand-blue">${cust.totalSpent.toLocaleString('es-AR')} gastados</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CALENDAR AGENDA TAB */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-card border border-dark-border p-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <input 
                type="date"
                value={calendarDate}
                onChange={(e) => setCalendarDate(e.target.value)}
                className="bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white"
              />
              <span className="text-xs text-dark-muted font-semibold">Agenda: {calendarDate}</span>
            </div>

            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    calendarView === view
                      ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow'
                      : 'bg-dark-bg border-dark-border text-dark-muted'
                  }`}
                >
                  {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>

          {/* COLOR LEGEND */}
          <div className="flex flex-wrap gap-4 text-xs font-bold justify-center py-2 bg-dark-card/50 border border-dark-border/50 rounded-xl">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-yellow" /> Pendiente (Pago/Turno)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-green" /> Confirmado / Disponible</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-blue" /> Finalizado (Auto Retirado)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-600" /> Cancelado / Ocupado</span>
          </div>

          {/* MOCKAGENDA LIST FOR CURRENT DATE */}
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-border/60 bg-dark-card/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Listado de Agenda</h3>
              <button 
                onClick={() => {
                  setNewBDate(calendarDate);
                  setShowBookingModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Turno Manual
              </button>
            </div>

            <div className="divide-y divide-dark-border/60">
              {bookings.filter(b => b.date === calendarDate).length === 0 ? (
                <div className="p-12 text-center text-xs text-dark-muted space-y-2">
                  <span>No hay turnos agendados para este día.</span>
                </div>
              ) : (
                bookings
                  .filter(b => b.date === calendarDate)
                  .map((b) => (
                    <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-dark-bg/40 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className={`px-3 py-2 rounded-xl text-center min-w-[70px] ${
                          b.bookingStatus === 'Finalizado' ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue' :
                          b.bookingStatus === 'Confirmado' ? 'bg-brand-green/10 border border-brand-green/30 text-brand-green' :
                          b.bookingStatus === 'Pendiente' ? 'bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow' :
                          'bg-brand-red/10 border border-brand-red/30 text-brand-red'
                        }`}>
                          <span className="block text-xs font-black font-display leading-none">{b.startTime}</span>
                          <span className="text-[9px] block text-dark-muted mt-1">{b.endTime} hs</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{b.customerName} ({b.vehiclePlate})</h4>
                          <div className="flex flex-wrap gap-2 items-center text-[10px] text-dark-muted">
                            <span className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-white font-medium">{b.service?.name}</span>
                            <span>📱 {b.customerPhone}</span>
                            <span>💵 Pago: {b.paymentMethod} ({b.paymentStatus})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {b.bookingStatus === 'Pendiente' && (
                          <button 
                            onClick={() => handleUpdateBookingStatus(b.id, 'Confirmado')}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-green/15 text-brand-green border border-brand-green/30 text-xs font-bold"
                          >
                            Confirmar Turno
                          </button>
                        )}
                        {b.bookingStatus !== 'Finalizado' && b.bookingStatus !== 'Cancelado' && (
                          <button 
                            onClick={() => handleUpdateBookingStatus(b.id, 'Finalizado', 'Pagado')}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-blue/15 text-brand-blue border border-brand-blue/30 text-xs font-bold"
                          >
                            Finalizar Trabajo
                          </button>
                        )}
                        {b.bookingStatus !== 'Cancelado' && b.bookingStatus !== 'Finalizado' && (
                          <button 
                            onClick={() => handleUpdateBookingStatus(b.id, 'Cancelado', 'Cancelado')}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-red/15 text-brand-red border border-brand-red/30 text-xs font-bold"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GESTION TURNOS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Todos los Turnos</h3>
            <button 
              onClick={() => {
                resetBookingForm();
                setShowBookingModal(true);
              }}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-blue-glow"
            >
              <Plus className="w-4 h-4" /> Crear Turno Manual
            </button>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/80 bg-dark-bg/60 text-dark-muted font-bold tracking-wider">
                    <th className="p-4">Fecha/Hora</th>
                    <th className="p-4">Cliente / Tel</th>
                    <th className="p-4">Vehículo</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Método de Pago</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        <span className="block">{b.date}</span>
                        <span className="text-[10px] text-dark-muted">{b.startTime} - {b.endTime} hs</span>
                      </td>
                      <td className="p-4">
                        <span className="block font-bold text-white">{b.customerName}</span>
                        <span className="text-[10px] text-dark-muted">{b.customerPhone}</span>
                      </td>
                      <td className="p-4 uppercase">
                        <span className="block text-white font-medium">{b.vehiclePlate}</span>
                        <span className="text-[10px] text-dark-muted">{b.vehicleType}</span>
                      </td>
                      <td className="p-4 font-semibold text-brand-blue">{b.service?.name}</td>
                      <td className="p-4">
                        <span className="block text-white font-medium">{b.paymentMethod}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${
                          b.paymentStatus === 'Pagado' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20'
                        }`}>{b.paymentStatus}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide ${getBookingStatusBadge(b.bookingStatus)}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {b.bookingStatus !== 'Finalizado' && b.bookingStatus !== 'Cancelado' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'Finalizado', 'Pagado')}
                              className="p-1.5 rounded bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-white transition-all"
                              title="Marcar Finalizado"
                            >
                              ✓
                            </button>
                          )}
                          {b.bookingStatus !== 'Cancelado' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'Cancelado', 'Cancelado')}
                              className="p-1.5 rounded bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all"
                              title="Cancelar Turno"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HISTORIAL CLIENTES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Base de Datos de Clientes</h3>
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/80 bg-dark-bg/60 text-dark-muted font-bold tracking-wider">
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Teléfono / Email</th>
                    <th className="p-4">Vehículo Predeterminado</th>
                    <th className="p-4 text-center">Puntos Acumulados</th>
                    <th className="p-4 text-right">Total Gastado</th>
                    <th className="p-4 text-center">Última Visita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="p-4 font-bold text-white">{c.name}</td>
                      <td className="p-4">
                        <span className="block text-white font-medium">{c.phone}</span>
                        <span className="text-[10px] text-dark-muted">{c.email || 'Sin Correo'}</span>
                      </td>
                      <td className="p-4 uppercase">
                        <span className="block text-white font-medium">{c.vehiclePlate}</span>
                        <span className="text-[10px] text-dark-muted">{c.vehicleType}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-extrabold ${
                          c.loyaltyPoints >= 10 ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30 animate-pulse' : 'bg-dark-bg text-dark-muted border border-dark-border'
                        }`}>
                          {c.loyaltyPoints} / 10
                        </span>
                        {c.loyaltyPoints >= 10 && <span className="block text-[8px] text-brand-orange font-bold uppercase mt-1">🎁 Próximo Lavado Gratis</span>}
                      </td>
                      <td className="p-4 text-right font-black text-brand-green">${c.totalSpent.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-center text-dark-muted">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Nunca'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SERVICIOS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Catálogo de Servicios</h3>
            <button 
              onClick={() => {
                resetServiceForm();
                setShowServiceModal(true);
              }}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-blue-glow"
            >
              <Plus className="w-4 h-4" /> Crear Servicio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between h-[300px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white">{s.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      s.active ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                    }`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-dark-muted line-clamp-3">{s.description}</p>
                  
                  <div className="flex gap-4 text-[10px] text-dark-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-orange" /> {s.durationMinutes >= 60 ? `${s.durationMinutes/60} hs` : `${s.durationMinutes} min`}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-dark-muted block">Precio</span>
                    <span className="text-xl font-black text-white font-display">${s.price.toLocaleString('es-AR')}</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteService(s.id)}
                      className="p-2 rounded bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white border border-brand-red/20 transition-all text-xs"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FINANZAS Y PAGOS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Libro Diario de Pagos</h3>
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/80 bg-dark-bg/60 text-dark-muted font-bold tracking-wider">
                    <th className="p-4">Fecha Pago</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Patente</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Método</th>
                    <th className="p-4 text-right">Importe</th>
                    <th className="p-4 text-center">Estado del Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {payments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="p-4 text-dark-muted font-mono">{new Date(p.date).toLocaleString()}</td>
                      <td className="p-4 font-bold text-white">{p.booking?.customerName}</td>
                      <td className="p-4 uppercase text-white font-medium">{p.booking?.vehiclePlate}</td>
                      <td className="p-4 text-brand-blue">{p.booking?.service?.name}</td>
                      <td className="p-4 text-white font-semibold">{p.method}</td>
                      <td className="p-4 text-right font-black text-white">${p.amount.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'Pagado' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' :
                          p.status === 'Cancelado' ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' :
                          'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calendar settings */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              📅 Días y Horarios del Estudio
            </h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-dark-muted mb-2 font-bold">Días Habilitados</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const active = settings.working_days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const nextDays = active 
                            ? settings.working_days.filter((d: string) => d !== day)
                            : [...settings.working_days, day];
                          handleUpdateSettings('working_days', nextDays);
                        }}
                        className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                          active 
                            ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' 
                            : 'bg-dark-bg border-dark-border text-dark-muted'
                        }`}
                      >
                        {day === 'Monday' ? 'Lunes' :
                         day === 'Tuesday' ? 'Martes' :
                         day === 'Wednesday' ? 'Miércoles' :
                         day === 'Thursday' ? 'Jueves' :
                         day === 'Friday' ? 'Viernes' :
                         day === 'Saturday' ? 'Sábado' : 'Domingo'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-muted mb-1.5 font-bold">Apertura (Hora)</label>
                  <input 
                    type="time" 
                    value={settings.working_hours.start}
                    onChange={(e) => {
                      const nextHours = { ...settings.working_hours, start: e.target.value };
                      handleUpdateSettings('working_hours', nextHours);
                    }}
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-dark-muted mb-1.5 font-bold">Cierre (Hora)</label>
                  <input 
                    type="time" 
                    value={settings.working_hours.end}
                    onChange={(e) => {
                      const nextHours = { ...settings.working_hours, end: e.target.value };
                      handleUpdateSettings('working_hours', nextHours);
                    }}
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5 font-bold">Intervalo de Turno</label>
                <select
                  value={settings.time_interval}
                  onChange={(e) => handleUpdateSettings('time_interval', e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="30">30 Minutos</option>
                  <option value="60">1 Hora (Recomendado)</option>
                  <option value="120">2 Horas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment gates configuration & time blocks */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              💳 Métodos de Pago Activos
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { key: 'cash', label: 'Efectivo en el Taller' },
                { key: 'transfer', label: 'Transferencia Bancaria' },
                { key: 'mercadopago', label: 'Mercado Pago' },
                { key: 'credit', label: 'Tarjeta de Crédito' },
                { key: 'debit', label: 'Tarjeta de Débito' },
              ].map((p) => {
                const active = settings.active_payments[p.key];
                return (
                  <label key={p.key} className="flex justify-between items-center p-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl cursor-pointer hover:border-dark-border">
                    <span className="text-white font-bold">{p.label}</span>
                    <input 
                      type="checkbox"
                      checked={active}
                      onChange={(e) => {
                        const nextVal = { ...settings.active_payments, [p.key]: e.target.checked };
                        handleUpdateSettings('active_payments', nextVal);
                      }}
                      className="rounded border-dark-border bg-transparent text-brand-blue focus:ring-0 w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-4 border-t border-dark-border/40 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase">Bloqueos de Agenda</h4>
              <p className="text-[11px] text-dark-muted">
                * Por defecto, el sistema bloquea de 12:00 a 13:00 hs para el almuerzo del personal de detailing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PROMOTIONS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Gestor de Cupones y Promociones</h3>
            <button 
              onClick={() => setShowPromoModal(true)}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-blue-glow"
            >
              <Plus className="w-4 h-4" /> Crear Cupón
            </button>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/80 bg-dark-bg/60 text-dark-muted font-bold tracking-wider">
                    <th className="p-4">Código de Promoción</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4 text-center">Descuento (%)</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Vencimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {promotions.map((p) => (
                    <tr key={p.id} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="p-4 font-bold text-brand-orange font-mono uppercase">{p.code}</td>
                      <td className="p-4 text-white font-medium">{p.description}</td>
                      <td className="p-4 text-center text-white font-bold">{p.discountPercent}%</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.active ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-brand-red/10 text-brand-red border border-brand-red/20'
                        }`}>{p.active ? 'Activo' : 'Inactivo'}</span>
                      </td>
                      <td className="p-4 text-center text-dark-muted">{p.expiryDate || 'Sin Expiración'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. REVIEWS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Moderación de Reseñas de Clientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.customerName}</h4>
                      <span className="text-[10px] text-dark-muted">{r.date}</span>
                    </div>
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Check key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-dark-text italic">"{r.comment}"</p>
                </div>

                <div className="pt-4 border-t border-dark-border/40 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    r.approved ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-yellow/10 text-brand-yellow'
                  }`}>
                    {r.approved ? 'Aprobado (Visible)' : 'Pendiente Moderación'}
                  </span>

                  <div className="flex gap-2">
                    {!r.approved ? (
                      <button 
                        onClick={() => handleToggleReviewApproval(r.id, true)}
                        className="px-2.5 py-1 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white border border-brand-green/20 rounded-lg text-xs font-bold transition-all"
                      >
                        Aprobar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggleReviewApproval(r.id, false)}
                        className="px-2.5 py-1 bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-white border border-brand-yellow/20 rounded-lg text-xs font-bold transition-all"
                      >
                        Ocultar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      
      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-lg w-full relative space-y-6">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-dark-muted hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white font-display">Registrar Turno Manualmente</h3>
            
            <form onSubmit={handleCreateBooking} className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-muted mb-1.5">Fecha</label>
                  <input type="date" value={newBDate} onChange={(e) => setNewBDate(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" required />
                </div>
                <div>
                  <label className="block text-dark-muted mb-1.5">Hora Inicio</label>
                  <input type="time" value={newBTime} onChange={(e) => setNewBTime(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" required />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-dark-muted mb-1.5">Servicio Detailing</label>
                <select value={newBService} onChange={(e) => setNewBService(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2.5 text-white" required>
                  <option value="">Seleccionar Servicio</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">Nombre Cliente</label>
                <input type="text" value={newBCustName} onChange={(e) => setNewBCustName(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="Ej. Carlos" required />
              </div>
              <div>
                <label className="block text-dark-muted mb-1.5">Teléfono</label>
                <input type="tel" value={newBCustPhone} onChange={(e) => setNewBCustPhone(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="+549..." required />
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">Patente</label>
                <input type="text" value={newBCustPlate} onChange={(e) => setNewBCustPlate(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white uppercase" placeholder="AE123MZ" required />
              </div>
              <div>
                <label className="block text-dark-muted mb-1.5">Vehículo</label>
                <select value={newBCustVehicle} onChange={(e) => setNewBCustVehicle(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white">
                  <option value="Sedan">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Motocicleta">Moto</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-dark-muted mb-1.5">Método de Pago</label>
                <select value={newBPayment} onChange={(e) => setNewBPayment(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2.5 text-white">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-dark-muted mb-1.5">Observaciones</label>
                <textarea value={newBObs} onChange={(e) => setNewBObs(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white h-16 resize-none" placeholder="Tiene barro, manchas, etc." />
              </div>

              <div className="col-span-2 pt-2 flex gap-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="w-1/2 py-2.5 rounded-xl border border-dark-border text-white hover:bg-dark-bg font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-blue-glow">Crear Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-lg w-full relative space-y-6">
            <button onClick={() => setShowServiceModal(false)} className="absolute top-4 right-4 text-dark-muted hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white font-display">Agregar Nuevo Servicio</h3>
            
            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block text-dark-muted mb-1.5">Nombre del Servicio</label>
                <input type="text" value={newSName} onChange={(e) => setNewSName(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="Ej. Lavado de Motor a Vapor" required />
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">Descripción</label>
                <textarea value={newSDesc} onChange={(e) => setNewSDesc(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white h-16 resize-none" placeholder="Descripción detallada del alcance..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-muted mb-1.5">Precio ($)</label>
                  <input type="number" value={newSPrice} onChange={(e) => setNewSPrice(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="3500" required />
                </div>
                <div>
                  <label className="block text-dark-muted mb-1.5">Duración (Minutos)</label>
                  <select value={newSDuration} onChange={(e) => setNewSDuration(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2.5 text-white">
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                    <option value="180">3 horas</option>
                    <option value="360">6 horas (Detailing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">¿Qué incluye? (Separado por comas)</label>
                <input type="text" value={newSIncludes} onChange={(e) => setNewSIncludes(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="Ej: Lavado interior, Hidratación de cueros, Aspirado" />
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">Imagen URL (Opcional)</label>
                <input type="text" value={newSImage} onChange={(e) => setNewSImage(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="https://..." />
              </div>

              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setShowServiceModal(false)} className="w-1/2 py-2.5 rounded-xl border border-dark-border text-white hover:bg-dark-bg font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-blue-glow">Crear Servicio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-sm w-full relative space-y-6">
            <button onClick={() => setShowPromoModal(false)} className="absolute top-4 right-4 text-dark-muted hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white font-display">Crear Código Promocional</h3>
            
            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block text-dark-muted mb-1.5">Código (Mayúsculas sin espacios)</label>
                <input type="text" value={newPCode} onChange={(e) => setNewPCode(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white uppercase font-mono" placeholder="Ej. VERANO20" required />
              </div>

              <div>
                <label className="block text-dark-muted mb-1.5">Descripción</label>
                <input type="text" value={newPDesc} onChange={(e) => setNewPDesc(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="Ej. 20% descuento por temporada" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-muted mb-1.5">Porcentaje (%)</label>
                  <input type="number" value={newPDiscount} onChange={(e) => setNewPDiscount(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" placeholder="15" required />
                </div>
                <div>
                  <label className="block text-dark-muted mb-1.5">Expiración (Opcional)</label>
                  <input type="date" value={newPExpiry} onChange={(e) => setNewPExpiry(e.target.value)} className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setShowPromoModal(false)} className="w-1/2 py-2.5 rounded-xl border border-dark-border text-white hover:bg-dark-bg font-bold">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-blue-glow">Crear Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
