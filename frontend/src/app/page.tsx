"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Star, 
  Clock, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  MessageSquare, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  
  // Review form states
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      const s = await api.getServices();
      setServices(s);
      const r = await api.getReviews();
      setReviews(r);
    }
    loadData();
  }, []);

  const handleSliderMove = (clientX: number, containerRect: DOMRect) => {
    const x = clientX - containerRect.left;
    const position = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX, container);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isResizing) {
      const container = e.currentTarget.getBoundingClientRect();
      handleSliderMove(e.clientX, container);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.createReview({ customerName, rating, comment });
      setReviewMessage("¡Gracias! Tu opinión fue enviada y será visible una vez aprobada.");
      setCustomerName('');
      setComment('');
      setRating(5);
      // Reload reviews
      const r = await api.getReviews();
      setReviews(r);
    } catch (err) {
      alert("Error al enviar reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-dark-border/40">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent z-10" />
        
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-8 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Flame className="w-3.5 h-3.5" /> Tratamientos Cerámicos & Corrección de Pintura
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display leading-tight tracking-tight text-white">
            El Brillo y la Protección <br />
            <span className="bg-gradient-to-r from-brand-blue via-white to-brand-orange bg-clip-text text-transparent">
              Que Tu Auto Se Merece
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-dark-muted text-base sm:text-xl leading-relaxed">
            Utilizamos productos importados premium y técnicas avanzadas de detallado para restaurar y proteger la carrocería de tu vehículo.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/reservar" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-brand-blue to-brand-blue-hover text-white shadow-blue-glow hover:shadow-xl hover:scale-105 transition-all text-center"
              id="hero-reserve-btn"
            >
              Reservar Turno Online
            </a>
            <a 
              href="#servicios" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-dark-card border border-dark-border text-white hover:bg-dark-border transition-all text-center"
            >
              Ver Servicios
            </a>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-dark-card/50 border border-dark-border/40 backdrop-blur-sm">
              <Award className="w-6 h-6 mx-auto text-brand-blue mb-2" />
              <p className="text-xs text-dark-muted">Certificación</p>
              <h5 className="text-white font-bold text-sm">Detailers Oficiales</h5>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/50 border border-dark-border/40 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 mx-auto text-brand-orange mb-2" />
              <p className="text-xs text-dark-muted">Garantía</p>
              <h5 className="text-white font-bold text-sm">Hasta 3 Años</h5>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/50 border border-dark-border/40 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 mx-auto text-brand-blue mb-2" />
              <p className="text-xs text-dark-muted">Materiales</p>
              <h5 className="text-white font-bold text-sm">100% Importados</h5>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/50 border border-dark-border/40 backdrop-blur-sm">
              <Clock className="w-6 h-6 mx-auto text-brand-orange mb-2" />
              <p className="text-xs text-dark-muted">Rapidez</p>
              <h5 className="text-white font-bold text-sm">Turnos Agendados</h5>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold text-brand-blue uppercase tracking-widest">Nuestras Soluciones</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Servicios de Detailing</h3>
          <p className="max-w-xl mx-auto text-dark-muted text-sm sm:text-base">
            Elegí el tratamiento ideal para tu vehículo. Modificamos y adaptamos el servicio según tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="rounded-2xl bg-dark-card border border-dark-border/60 overflow-hidden flex flex-col group hover:border-brand-blue/30 transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={service.imageUrl} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-dark-bg/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-brand-orange border border-dark-border">
                  📍 {service.durationMinutes >= 60 ? `${service.durationMinutes / 60} hs` : `${service.durationMinutes} min`}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white tracking-tight">{service.name}</h4>
                  <p className="text-sm text-dark-muted line-clamp-3">{service.description}</p>
                  
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">¿Qué incluye?</p>
                    <ul className="space-y-1.5">
                      {service.includes.slice(0, 4).map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-dark-muted flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand-blue flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {service.includes.length > 4 && (
                        <li className="text-xs text-brand-blue font-semibold">y {service.includes.length - 4} más...</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-dark-muted block">Precio Regular</span>
                    <span className="text-2xl font-black text-white font-display">${service.price.toLocaleString('es-AR')}</span>
                  </div>
                  
                  <a 
                    href={`/reservar?service=${service.id}`}
                    className="p-3 rounded-xl bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white transition-all flex items-center justify-center gap-1 text-sm font-semibold"
                  >
                    Reservar <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After Slider Section */}
      <section id="galeria" className="py-24 bg-dark-card/30 border-y border-dark-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-brand-orange uppercase tracking-widest">Resultados Reales</h2>
              <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Galería Antes y Después</h3>
              <p className="text-dark-muted text-sm sm:text-base leading-relaxed">
                Arrastrá el deslizador en el medio para comparar el estado en el que ingresan los vehículos y el brillo final tras nuestro tratamiento de corrección de laca y abrillantado cerámico.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-orange">
                    🚗
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Descontaminado Físico</h5>
                    <p className="text-xs text-dark-muted">Eliminamos resinas, brea e impurezas adheridas al barniz.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-blue">
                    ✨
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Abrillantado de Alta Gama</h5>
                    <p className="text-xs text-dark-muted">Eliminación del 90% de las micro-rayas superficiales.</p>
                  </div>
                </div>
              </div>
              
              <a 
                href="/reservar" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-brand-orange hover:bg-brand-orange-hover text-white transition-all shadow-orange-glow"
              >
                Quiero este resultado <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Slider Widget */}
            <div className="lg:col-span-7">
              <div 
                className="relative h-[300px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-dark-border/80 shadow-premium select-none cursor-ew-resize"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={() => setIsResizing(true)}
                onMouseUp={() => setIsResizing(false)}
                onMouseLeave={() => setIsResizing(false)}
              >
                {/* BEFORE Image (Under) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=80')" }} // scratched car/dirty wheels
                >
                  <div className="absolute bottom-4 left-4 bg-dark-bg/75 px-3 py-1 rounded text-xs font-bold text-white border border-dark-border uppercase">
                    Antes
                  </div>
                </div>

                {/* AFTER Image (Over) */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-75"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80')", // shiny sports car detail
                    width: `${sliderPosition}%` 
                  }}
                >
                  <div className="absolute bottom-4 right-4 bg-brand-blue/85 px-3 py-1 rounded text-xs font-bold text-white border border-brand-blue/30 uppercase">
                    Después
                  </div>
                </div>

                {/* Handle Bar */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white hover:bg-brand-blue cursor-ew-resize z-30"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-dark-bg flex items-center justify-center shadow-lg font-bold text-sm border-2 border-brand-blue">
                    ↔
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="opiniones" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs font-bold text-brand-blue uppercase tracking-widest">Opiniones</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Lo Que Dicen Nuestros Clientes</h3>
            <p className="text-dark-muted text-sm">
              La satisfacción de quienes nos eligen es nuestra mayor prioridad. Dejanos tu comentario si ya realizaste un servicio con nosotros.
            </p>

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
              <h4 className="text-white font-bold text-sm">Dejanos tu Calificación</h4>
              
              <div>
                <label className="block text-xs text-dark-muted mb-1.5">Nombre Completo</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                  placeholder="Ej. Martín García"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1.5">Estrellas</label>
                <div className="flex gap-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-dark-border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-dark-muted mb-1.5">Tu Comentario</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue h-20 resize-none"
                  placeholder="¿Cómo fue tu experiencia?"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-hover shadow-blue-glow hover:shadow-lg disabled:opacity-55 transition-all"
              >
                {submittingReview ? 'Enviando...' : 'Enviar Opinión'}
              </button>

              {reviewMessage && (
                <p className="text-xs text-brand-green font-semibold text-center mt-2">{reviewMessage}</p>
              )}
            </form>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 rounded-2xl bg-dark-card/45 border border-dark-border/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-dark-text italic font-medium">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-dark-border/40">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{rev.customerName}</h5>
                      <span className="text-[10px] text-dark-muted">{rev.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Location and Contact Section */}
      <section id="contacto" className="py-24 bg-dark-card/10 border-t border-dark-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-brand-orange uppercase tracking-widest">¿Dónde encontrarnos?</h2>
                <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Ubicación y Contacto</h3>
                <p className="text-dark-muted text-sm leading-relaxed">
                  Estamos ubicados estratégicamente en el barrio de Palermo, de fácil acceso y con seguridad permanente las 24 horas para resguardar tu vehículo.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-brand-blue">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Dirección</h5>
                    <p className="text-xs text-dark-muted">Av. del Libertador 4800, Palermo, CABA, Argentina</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-brand-orange">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">WhatsApp / Teléfono</h5>
                    <p className="text-xs text-dark-muted">+54 9 11 2233-4455</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-brand-blue">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Correo Electrónico</h5>
                    <p className="text-xs text-dark-muted">info@detailingpro.com</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 space-y-2">
                <h6 className="text-white font-bold text-xs uppercase tracking-wider">¿Tenés una urgencia?</h6>
                <p className="text-xs text-dark-muted">
                  Podés contactarnos directamente a nuestro WhatsApp de atención inmediata haciendo click en el botón inferior.
                </p>
                <a 
                  href="https://wa.me/5491122334455?text=Hola!%20Quiero%20consultar%20por%20un%20turno%20de%20detailing" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block mt-2 text-xs font-bold text-brand-blue hover:text-white transition-colors"
                >
                  💬 Enviar WhatsApp Directo →
                </a>
              </div>
            </div>

            {/* Google Maps Mock Container */}
            <div className="lg:col-span-7 h-[300px] sm:h-[450px] rounded-2xl overflow-hidden border border-dark-border relative shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.974442111166!2d-58.42398572426033!3d-34.579482472962366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb57f93821035%3A0x6b1cfb5fa207bc!2sAv.%20del%20Libertador%204800%2C%20C1426%20CABA!5e0!3m2!1ses-419!2sar!4v1719660000000!5m2!1ses-419!2sar" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(1.2)" }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4 bg-dark-bg/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-dark-border text-xs text-white max-w-[240px]">
                <p className="font-bold">✨ Detailing Pro Studio</p>
                <p className="text-[10px] text-dark-muted mt-0.5">Av. del Libertador 4800, Palermo</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
