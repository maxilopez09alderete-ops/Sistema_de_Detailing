"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  Car, 
  FileText, 
  CreditCard, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Ticket
} from 'lucide-react';

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('service');

  // Load basic configurations
  const [services, setServices] = useState<any[]>([]);
  const [activePayments, setActivePayments] = useState<any>({
    cash: true, transfer: true, mercadopago: true, credit: true, debit: true
  });
  
  // Wizard steps: 1 = Service, 2 = Vehicle, 3 = Date & Time, 4 = Details & Payment, 5 = Done
  const [step, setStep] = useState(1);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected Booking details
  const [selectedService, setSelectedService] = useState<any>(null);
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  // Promo code variables
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Final booked object
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Fetch initial services and configuration settings
  useEffect(() => {
    const loadConfig = async () => {
      const s = await api.getServices();
      setServices(s);
      
      const config = await api.getSettings();
      if (config.active_payments) {
        setActivePayments(config.active_payments);
      }

      if (initialServiceId && s.length > 0) {
        const found = s.find(item => item.id === initialServiceId);
        if (found) {
          setSelectedService(found);
          setStep(2); // Jump directly to vehicle selection if service selected from landing page
        }
      }
    };
    loadConfig();
  }, [initialServiceId]);

  // Load available slots when date or service changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadSlots = async () => {
        setLoadingSlots(true);
        setSelectedSlot('');
        try {
          const slots = await api.getAvailableSlots(selectedDate, selectedService.id);
          setAvailableSlots(slots);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [selectedDate, selectedService]);

  // Get tomorrow's date string YYYY-MM-DD to restrict past choices
  const getMinDateString = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Turnos starting from tomorrow
    return today.toISOString().split('T')[0];
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoError('');
    setPromoSuccess('');
    try {
      const res = await api.validatePromoCode(promoCode);
      if (res.valid) {
        setDiscountPercent(res.discountPercent);
        setPromoSuccess(`¡Cupón aplicado! ${res.discountPercent}% de descuento.`);
      }
    } catch (e: any) {
      setPromoError('El cupón ingresado no es válido o está vencido.');
      setDiscountPercent(0);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !vehiclePlate || !selectedSlot) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      const bookingData = {
        date: selectedDate,
        startTime: selectedSlot,
        serviceId: selectedService.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        vehicleType,
        vehiclePlate: vehiclePlate.toUpperCase(),
        observations,
        paymentMethod,
        promoCode: discountPercent > 0 ? promoCode : undefined
      };

      const result = await api.createBooking(bookingData);
      setConfirmedBooking(result);
      setStep(5);
    } catch (err) {
      alert("Ocurrió un error al agendar tu turno. Por favor, reintenta.");
    }
  };

  // Pricing helper
  const getCalculatedPrice = () => {
    if (!selectedService) return 0;
    const base = selectedService.price;
    if (discountPercent > 0) {
      return base - (base * discountPercent / 100);
    }
    return base;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Wizard Progress Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold font-display text-white">Reserva tu Turno Online</h1>
        <p className="text-sm text-dark-muted mt-1">Completá el asistente en menos de 2 minutos.</p>
        
        {step < 5 && (
          <div className="mt-8 flex items-center justify-center gap-2 max-w-md mx-auto">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step >= num 
                      ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow' 
                      : 'bg-dark-card border-dark-border text-dark-muted'
                  }`}
                >
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 4 && (
                  <div className={`h-0.5 flex-grow rounded transition-all ${
                    step > num ? 'bg-brand-blue' : 'bg-dark-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-brand-blue w-5 h-5" /> Paso 1: Elegí el Servicio
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`p-6 rounded-2xl bg-dark-card border cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between h-[320px] ${
                  selectedService?.id === s.id 
                    ? 'border-brand-blue shadow-blue-glow bg-brand-blue/5' 
                    : 'border-dark-border/80 hover:border-dark-muted'
                }`}
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-dark-muted line-clamp-4">{s.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-dark-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-orange" /> {s.durationMinutes >= 60 ? `${s.durationMinutes/60} hs` : `${s.durationMinutes} min`}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dark-border/40 flex items-center justify-between">
                  <span className="text-xl font-black text-white font-display">${s.price.toLocaleString('es-AR')}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedService?.id === s.id 
                      ? 'border-brand-blue bg-brand-blue text-white' 
                      : 'border-dark-border'
                  }`}>
                    {selectedService?.id === s.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-blue hover:bg-brand-blue-hover text-white shadow-blue-glow disabled:opacity-40 flex items-center gap-2"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Vehicle Type */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-border text-dark-muted">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="text-brand-orange w-5 h-5" /> Paso 2: Tipo de Vehículo
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 'Sedan', name: 'Sedán / Hatchback', icon: '🚗' },
              { id: 'SUV', name: 'SUV / Monovolumen', icon: '🚙' },
              { id: 'Pickup', name: 'Pickup / Utilitario', icon: '🛻' },
              { id: 'Motocicleta', name: 'Motocicleta', icon: '🏍️' }
            ].map((v) => (
              <div 
                key={v.id}
                onClick={() => setVehicleType(v.id)}
                className={`p-6 rounded-2xl bg-dark-card border cursor-pointer hover:border-dark-muted transition-all text-center space-y-3 ${
                  vehicleType === v.id 
                    ? 'border-brand-orange shadow-orange-glow bg-brand-orange/5' 
                    : 'border-dark-border/80'
                }`}
              >
                <div className="text-4xl">{v.icon}</div>
                <h4 className="text-sm font-bold text-white">{v.name}</h4>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-dark-muted mb-2 font-semibold">Patente del Vehículo (Obligatorio)</label>
            <input 
              type="text"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="max-w-xs w-full bg-dark-input border border-dark-border rounded-xl px-4 py-3 text-sm text-white uppercase placeholder-dark-muted focus:outline-none focus:border-brand-orange"
              placeholder="Ej. AE123MZ o AD456OP"
              maxLength={7}
            />
          </div>

          <div className="pt-6 flex justify-between">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-dark-border text-dark-muted hover:bg-dark-card hover:text-white"
            >
              Volver
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={!vehiclePlate || vehiclePlate.trim().length < 5}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-blue hover:bg-brand-blue-hover text-white shadow-blue-glow disabled:opacity-40 flex items-center gap-2"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Choose Date & Time */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-border text-dark-muted">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="text-brand-blue w-5 h-5" /> Paso 3: Fecha y Horario
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs text-dark-muted font-semibold uppercase tracking-wider">Elegí la fecha</label>
              <input 
                type="date"
                min={getMinDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue"
              />
              <p className="text-[11px] text-dark-muted">
                * Trabajamos de Lunes a Sábados de 09:00 a 18:00 hs. Feriados cerrados.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-dark-muted font-semibold uppercase tracking-wider">Horarios Disponibles</label>
              
              {!selectedDate && (
                <div className="p-8 rounded-xl border border-dark-border/40 text-center text-xs text-dark-muted">
                  Por favor, seleccioná primero una fecha.
                </div>
              )}

              {selectedDate && loadingSlots && (
                <div className="p-8 rounded-xl border border-dark-border/40 text-center text-xs text-brand-blue animate-pulse">
                  Calculando turnos libres...
                </div>
              )}

              {selectedDate && !loadingSlots && availableSlots.length === 0 && (
                <div className="p-8 rounded-xl border border-brand-red/20 bg-brand-red/5 text-center text-xs text-brand-red">
                  No hay horarios disponibles para esta fecha. Elegí otro día.
                </div>
              )}

              {selectedDate && !loadingSlots && availableSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSlot === slot
                          ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow'
                          : 'bg-dark-card border-dark-border text-white hover:border-dark-muted'
                      }`}
                    >
                      {slot} hs
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-between">
            <button 
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-dark-border text-dark-muted hover:bg-dark-card hover:text-white"
            >
              Volver
            </button>
            <button 
              onClick={() => setStep(4)}
              disabled={!selectedSlot || !selectedDate}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-blue hover:bg-brand-blue-hover text-white shadow-blue-glow disabled:opacity-40 flex items-center gap-2"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Personal Details & Payment */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setStep(3)} className="p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-border text-dark-muted">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-brand-orange w-5 h-5" /> Paso 4: Completá tus Datos y Pago
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1.5 font-medium">Nombre y Apellido (Obligatorio)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1.5 font-medium">Teléfono Celular (Obligatorio)</label>
                <input 
                  type="tel" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                  placeholder="Ej. +5491122334455"
                  required
                />
                <p className="text-[10px] text-dark-muted mt-1">* Se usará para enviarte la confirmación por WhatsApp.</p>
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1.5 font-medium">Email (Opcional)</label>
                <input 
                  type="email" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                  placeholder="Ej. juan@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1.5 font-medium">Observaciones (Opcional)</label>
                <textarea 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue h-24 resize-none"
                  placeholder="Ej. El baúl necesita limpieza profunda, tiene manchas de grasa, barro adherido en guardabarros, etc."
                />
              </div>
            </div>

            {/* Payment selection & Invoice Summary */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">Método de Pago</h4>
                <div className="space-y-2">
                  {activePayments.cash && (
                    <label className="flex items-center justify-between p-3 rounded-xl border border-dark-border cursor-pointer hover:border-dark-muted">
                      <div className="flex items-center gap-2.5">
                        <input type="radio" name="payment" value="Efectivo" checked={paymentMethod === 'Efectivo'} onChange={() => setPaymentMethod('Efectivo')} className="text-brand-blue focus:ring-0 bg-transparent" />
                        <span className="text-xs text-white">Efectivo en el taller</span>
                      </div>
                      <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded font-bold uppercase">Mejor Opción</span>
                    </label>
                  )}
                  {activePayments.transfer && (
                    <label className="flex items-center justify-between p-3 rounded-xl border border-dark-border cursor-pointer hover:border-dark-muted">
                      <div className="flex items-center gap-2.5">
                        <input type="radio" name="payment" value="Transferencia" checked={paymentMethod === 'Transferencia'} onChange={() => setPaymentMethod('Transferencia')} className="text-brand-blue bg-transparent" />
                        <span className="text-xs text-white">Transferencia Bancaria (CBU)</span>
                      </div>
                    </label>
                  )}
                  {activePayments.mercadopago && (
                    <label className="flex items-center justify-between p-3 rounded-xl border border-dark-border cursor-pointer hover:border-dark-muted">
                      <div className="flex items-center gap-2.5">
                        <input type="radio" name="payment" value="Mercado Pago" checked={paymentMethod === 'Mercado Pago'} onChange={() => setPaymentMethod('Mercado Pago')} className="text-brand-blue bg-transparent" />
                        <span className="text-xs text-white">Mercado Pago (Crédito/Débito/Dinero)</span>
                      </div>
                      <span className="text-[10px] text-brand-blue font-bold">Pago Online</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Coupon Apply */}
              <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5"><Ticket className="w-4 h-4 text-brand-orange" /> ¿Tenés un cupón?</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow bg-dark-input border border-dark-border rounded-xl px-4 py-2 text-xs text-white uppercase placeholder-dark-muted focus:outline-none"
                    placeholder="Ej: BIENVENIDA10"
                  />
                  <button 
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-dark-border hover:bg-dark-muted text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Aplicar
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-brand-red font-medium">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-brand-green font-medium">{promoSuccess}</p>}
              </div>

              {/* Booking Summary */}
              <div className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/15 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resumen de Reserva</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Servicio:</span>
                    <span className="text-white font-semibold">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Vehículo:</span>
                    <span className="text-white font-semibold">{vehicleType} (Patente: {vehiclePlate.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Fecha y Hora:</span>
                    <span className="text-white font-semibold">{selectedDate} a las {selectedSlot} hs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Método de Pago:</span>
                    <span className="text-white font-semibold">{paymentMethod}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-brand-green">
                      <span>Descuento aplicado:</span>
                      <span>-{discountPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-dark-border/40 flex justify-between items-end">
                  <span className="text-sm font-bold text-white">Total a Pagar:</span>
                  <span className="text-3xl font-black text-brand-blue font-display">${getCalculatedPrice().toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-border/40 flex justify-between">
            <button 
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-dark-border text-dark-muted hover:bg-dark-card hover:text-white"
            >
              Volver
            </button>
            <button 
              type="submit"
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-hover shadow-blue-glow hover:scale-105 transition-all flex items-center gap-2"
            >
              Confirmar Turno y Finalizar <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Booking Confirmed Screen */}
      {step === 5 && confirmedBooking && (
        <div className="glass rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto border-brand-blue/30 shadow-blue-glow">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center mx-auto text-2xl animate-bounce">
            ✓
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">¡Turno Reservado con Éxito!</h2>
            <p className="text-xs text-brand-blue font-bold tracking-wide uppercase">ID de Reserva: #{confirmedBooking.id}</p>
            <p className="text-sm text-dark-muted max-w-md mx-auto">
              Hemos registrado tu turno para el día <span className="text-white font-semibold">{selectedDate}</span> a las <span className="text-white font-semibold">{selectedSlot} hs</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-bg/60 border border-dark-border/60 text-left space-y-3 max-w-md mx-auto">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Detalles para asistir</h4>
            <p className="text-xs text-dark-muted">🚗 <span className="text-white font-semibold">{selectedService?.name}</span> para tu <span className="text-white">{vehicleType}</span> (Patente: <span className="text-white">{vehiclePlate.toUpperCase()}</span>)</p>
            <p className="text-xs text-dark-muted">📍 Av. del Libertador 4800, Palermo, CABA</p>
            <p className="text-xs text-dark-muted">💵 Pago: <span className="text-white font-semibold">${confirmedBooking.totalAmount.toLocaleString('es-AR')} ({paymentMethod})</span></p>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-xs text-dark-muted">
              Te hemos enviado un mensaje de confirmación a tu teléfono <span className="text-white font-semibold">{customerPhone}</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`https://wa.me/${customerPhone.replace('+', '')}?text=Hola!%20Recibí%20la%20confirmación%20del%20turno%20para%20el%20servicio%20de%20detail%20el%20día%20${selectedDate}%20a%20las%20${selectedSlot}%20hs.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                💬 Ver en WhatsApp
              </a>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border hover:bg-dark-border text-white transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingWizard() {
  return (
    <Suspense fallback={
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-dark-muted">Cargando asistente de reservas...</p>
        </div>
      </div>
    }>
      <BookingWizardContent />
    </Suspense>
  );
}
