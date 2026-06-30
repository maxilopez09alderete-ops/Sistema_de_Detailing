// src/lib/api.ts

const API_BASE_URL = 'http://localhost:5000/api';

// Fallback Mock database in localStorage to ensure the app works even if backend is offline
const MOCK_STORAGE_KEY = 'detailing_mock_db_2026';

const DEFAULT_MOCK_DATA = {
  services: [
    {
      id: "srv-basico",
      name: "Lavado Básico",
      description: "Limpieza rápida y efectiva para mantener tu auto impecable.",
      price: 2500,
      durationMinutes: 60,
      includes: [
        "Lavado exterior con shampoo pH neutro",
        "Aspirado completo del interior",
        "Secado con microfibra anti-rayas",
        "Acondicionado básico de cubiertas"
      ],
      imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
      active: true
    },
    {
      id: "srv-premium",
      name: "Lavado Premium",
      description: "Limpieza detallada exterior e interior ideal para un mantenimiento completo.",
      price: 5000,
      durationMinutes: 120,
      includes: [
        "Todo lo del Lavado Básico",
        "Limpieza profunda de llantas y pasarruedas",
        "Acondicionado completo de interiores (plásticos, tableros)",
        "Aplicación de cera rápida de carnauba para brillo y protección"
      ],
      imageUrl: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80",
      active: true
    },
    {
      id: "srv-completo",
      name: "Detailing Completo",
      description: "Restauración completa, pulido de pintura y protección cerámica premium.",
      price: 18000,
      durationMinutes: 360,
      includes: [
        "Todo lo del Lavado Premium",
        "Lavado a detalle con técnica de dos baldes",
        "Descontaminado físico (Claybar) y químico de pintura",
        "Pulido de corrección de pintura (elimina rayas finas/swirls)",
        "Protección sellador cerámico (duración de 12 meses)",
        "Limpieza profunda y desinfección del interior con extractor de vapor",
        "Restauración y acondicionamiento de plásticos exteriores con protección UV"
      ],
      imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
      active: true
    }
  ],
  bookings: [
    {
      id: "bk-1",
      date: "2026-06-28",
      startTime: "10:00",
      endTime: "12:00",
      customerName: "Carlos Gómez",
      customerPhone: "+5491122334455",
      customerEmail: "carlos.gomez@gmail.com",
      vehicleType: "Sedan",
      vehiclePlate: "AE123MZ",
      observations: "Tiene pelos de perro en los asientos traseros.",
      paymentMethod: "Transferencia",
      paymentStatus: "Pagado",
      bookingStatus: "Finalizado",
      totalAmount: 5000,
      serviceId: "srv-premium",
    },
    {
      id: "bk-2",
      date: "2026-06-29",
      startTime: "09:00",
      endTime: "10:00",
      customerName: "Juan Pérez",
      customerPhone: "+5491199887766",
      customerEmail: "juan.perez@gmail.com",
      vehicleType: "Sedan",
      vehiclePlate: "AD999ZZ",
      observations: "Lavado rápido por favor.",
      paymentMethod: "Efectivo",
      paymentStatus: "Pagado",
      bookingStatus: "Finalizado",
      totalAmount: 2500,
      serviceId: "srv-basico",
    },
    {
      id: "bk-3",
      date: "2026-06-29",
      startTime: "14:00",
      endTime: "16:00",
      customerName: "María Rodríguez",
      customerPhone: "+5491155667788",
      customerEmail: "maria.rod@hotmail.com",
      vehicleType: "SUV",
      vehiclePlate: "AD456OP",
      observations: "Limpieza profunda del baúl que tiene una mancha de aceite.",
      paymentMethod: "Mercado Pago",
      paymentStatus: "Pagado",
      bookingStatus: "Confirmado",
      totalAmount: 5000,
      serviceId: "srv-premium",
    },
    {
      id: "bk-4",
      date: "2026-06-30",
      startTime: "09:00",
      endTime: "15:00",
      customerName: "Lucía Fernández",
      customerPhone: "+5491133445566",
      customerEmail: "lucia.f@gmail.com",
      vehicleType: "Pickup",
      vehiclePlate: "AF789QR",
      observations: "Tiene bastante barro abajo, estuvo en el campo.",
      paymentMethod: "Tarjeta Credito",
      paymentStatus: "Pendiente",
      bookingStatus: "Pendiente",
      totalAmount: 18000,
      serviceId: "srv-completo",
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "Carlos Gómez",
      phone: "+5491122334455",
      email: "carlos.gomez@gmail.com",
      vehicleType: "Sedan",
      vehiclePlate: "AE123MZ",
      loyaltyPoints: 3,
      totalSpent: 7500,
      lastVisit: "2026-06-28",
    },
    {
      id: "cust-2",
      name: "María Rodríguez",
      phone: "+5491155667788",
      email: "maria.rod@hotmail.com",
      vehicleType: "SUV",
      vehiclePlate: "AD456OP",
      loyaltyPoints: 1,
      totalSpent: 5000,
      lastVisit: "2026-06-29",
    },
    {
      id: "cust-3",
      name: "Lucía Fernández",
      phone: "+5491133445566",
      email: "lucia.f@gmail.com",
      vehicleType: "Pickup",
      vehiclePlate: "AF789QR",
      loyaltyPoints: 10,
      totalSpent: 28000,
      lastVisit: "2026-06-20",
    }
  ],
  settings: {
    working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    working_hours: { start: '09:00', end: '18:00' },
    time_interval: '60',
    active_payments: { cash: true, transfer: true, mercadopago: true, credit: true, debit: true },
    blocked_slots: [{ type: 'recurring_daily', start: '12:00', end: '13:00', reason: 'Almuerzo' }],
    blocked_dates: []
  },
  promotions: [
    { id: "pr-1", code: "BIENVENIDA10", description: "10% de descuento en tu primer servicio", discountPercent: 10, active: true },
    { id: "pr-2", code: "WINTERGLOW", description: "15% de descuento especial invierno", discountPercent: 15, active: true }
  ],
  reviews: [
    { id: "rev-1", customerName: "Carlos Gómez", rating: 5, comment: "Excelente el lavado premium. Sacaron todas las manchas de los asientos de tela y las llantas quedaron brillantes. Muy recomendado!", date: "2026-06-25", approved: true },
    { id: "rev-2", customerName: "Lucía Fernández", rating: 5, comment: "Hice el Detailing Completo y sellador cerámico. Mi camioneta parece recién sacada de la concesionaria. Increíble atención al detalle.", date: "2026-06-20", approved: true },
    { id: "rev-3", customerName: "Juan Pérez", rating: 4, comment: "Muy buen servicio y de confianza. Altamente recomendable.", date: "2026-06-28", approved: true }
  ]
};

interface MockDB {
  services: any[];
  bookings: any[];
  customers: any[];
  settings: any;
  promotions: any[];
  reviews: any[];
}

// Firebase configuration endpoints
const FIREBASE_URL = 'https://sistemasdedetailing-default-rtdb.firebaseio.com';


// Helper to write to Firebase
async function writeFirebase(path: string, data: any): Promise<void> {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error('Firebase write error:', err);
  }
}

// Helper to read from Firebase and fallback to local storage
async function readFirebase(path: string, defaultData: any): Promise<any> {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data !== null) {
        return data;
      }
    }
  } catch (err) {
    console.error('Firebase read error:', err);
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(MOCK_STORAGE_KEY + '_' + path);
      if (local) return JSON.parse(local);
    } catch (_) {}
  }
  return defaultData;
}

let isSeeded = false;

async function ensureSeeded() {
  if (isSeeded) return;
  try {
    const res = await fetch(`${FIREBASE_URL}/.json`);
    if (res.ok) {
      const db = await res.json();
      if (db === null || !db.services || db.services.length === 0) {
        // Seed entire mock data to Firebase
        await fetch(`${FIREBASE_URL}/.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_MOCK_DATA)
        });
        console.log('Firebase Realtime Database seeded successfully.');
      }
      isSeeded = true;
    }
  } catch (err) {
    console.error('Firebase seeding check error:', err);
  }
}

// Check JWT Token
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('detailing_admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

// API client functions
export const api = {
  // 1. SERVICES
  getServices: async (): Promise<any[]> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    return services.filter((s: any) => s && s.active);
  },

  getAdminServices: async (): Promise<any[]> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    return services.filter(Boolean);
  },

  createService: async (serviceData: any): Promise<any> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    const newService = { id: `srv-${Math.random().toString(36).substr(2, 9)}`, ...serviceData, active: true };
    services.push(newService);
    await writeFirebase('services', services);
    if (typeof window !== 'undefined') localStorage.setItem(MOCK_STORAGE_KEY + '_services', JSON.stringify(services));
    return newService;
  },

  updateService: async (id: string, serviceData: any): Promise<any> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    const idx = services.findIndex((s: any) => s && s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...serviceData };
      await writeFirebase('services', services);
      if (typeof window !== 'undefined') localStorage.setItem(MOCK_STORAGE_KEY + '_services', JSON.stringify(services));
      return services[idx];
    }
  },

  deleteService: async (id: string): Promise<boolean> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const idx = services.findIndex((s: any) => s && s.id === id);
    if (idx !== -1) {
      const hasBookings = bookings.some((b: any) => b && b.serviceId === id);
      if (hasBookings) {
        services[idx].active = false;
      } else {
        services.splice(idx, 1);
      }
      await writeFirebase('services', services);
      if (typeof window !== 'undefined') localStorage.setItem(MOCK_STORAGE_KEY + '_services', JSON.stringify(services));
      return true;
    }
    return false;
  },

  // 2. BOOKINGS & SLOTS
  getAvailableSlots: async (date: string, serviceId: string): Promise<string[]> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const settings = await readFirebase('settings', DEFAULT_MOCK_DATA.settings);

    const service = services.find((s: any) => s && s.id === serviceId);
    if (!service) return [];
    
    const dateBookings = bookings.filter((b: any) => b && b.date === date && b.bookingStatus !== 'Cancelado');
    const interval = parseInt(settings.time_interval || '60');
    
    const slots = [];
    const startMins = 9 * 60; // 09:00
    const endMins = 18 * 60;   // 18:00
    const duration = service.durationMinutes;

    for (let current = startMins; current < endMins; current += interval) {
      const slotEnd = current + duration;
      if (slotEnd > endMins) continue;
      
      if (current < 13 * 60 && slotEnd > 12 * 60) continue;

      let isOverlapping = false;
      for (const b of dateBookings) {
        const [sh, sm] = b.startTime.split(':').map(Number);
        const [eh, em] = b.endTime.split(':').map(Number);
        const bStart = sh * 60 + sm;
        const bEnd = eh * 60 + em;

        if (current < bEnd && slotEnd > bStart) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  },

  createBooking: async (bookingData: any): Promise<any> => {
    await ensureSeeded();
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const customers = await readFirebase('customers', DEFAULT_MOCK_DATA.customers);
    const promotions = await readFirebase('promotions', DEFAULT_MOCK_DATA.promotions);

    const service = services.find((s: any) => s && s.id === bookingData.serviceId);
    const duration = service ? service.durationMinutes : 60;
    
    const [sh, sm] = bookingData.startTime.split(':').map(Number);
    const endMins = (sh * 60 + sm) + duration;
    const eh = Math.floor(endMins / 60);
    const em = endMins % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    let customer = customers.find((c: any) => c && c.phone === bookingData.customerPhone);
    let totalAmount = service ? service.price : 2500;

    if (customer) {
      if (customer.loyaltyPoints >= 10) {
        totalAmount = 0;
        customer.loyaltyPoints = 0;
      } else {
        if (bookingData.promoCode) {
          const promo = promotions.find((p: any) => p && p.code === bookingData.promoCode.toUpperCase() && p.active);
          if (promo) {
            totalAmount = totalAmount - (totalAmount * promo.discountPercent / 100);
          }
        }
      }
    } else {
      customer = {
        id: `cust-${Math.random().toString(36).substr(2, 9)}`,
        name: bookingData.customerName,
        phone: bookingData.customerPhone,
        email: bookingData.customerEmail || '',
        vehicleType: bookingData.vehicleType,
        vehiclePlate: bookingData.vehiclePlate.toUpperCase(),
        loyaltyPoints: 0,
        totalSpent: 0,
        lastVisit: null
      };
      customers.push(customer);
    }

    const newBooking = {
      id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
      ...bookingData,
      endTime,
      paymentStatus: 'Pendiente',
      bookingStatus: 'Pendiente',
      totalAmount
    };

    bookings.push(newBooking);
    await writeFirebase('bookings', bookings);
    await writeFirebase('customers', customers);

    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORAGE_KEY + '_bookings', JSON.stringify(bookings));
      localStorage.setItem(MOCK_STORAGE_KEY + '_customers', JSON.stringify(customers));
    }
    return newBooking;
  },

  getBookings: async (startDate?: string, endDate?: string): Promise<any[]> => {
    await ensureSeeded();
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const services = await readFirebase('services', DEFAULT_MOCK_DATA.services);

    let list = bookings.filter(Boolean).map((b: any) => ({
      ...b,
      service: services.find((s: any) => s && s.id === b.serviceId)
    }));

    if (startDate && endDate) {
      list = list.filter((b: any) => b.date >= startDate && b.date <= endDate);
    }
    return list;
  },

  updateBooking: async (id: string, updateData: any): Promise<any> => {
    await ensureSeeded();
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const customers = await readFirebase('customers', DEFAULT_MOCK_DATA.customers);

    const idx = bookings.findIndex((b: any) => b && b.id === id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...updateData };
      
      if (updateData.bookingStatus === 'Finalizado') {
        const booking = bookings[idx];
        const customer = customers.find((c: any) => c && c.phone === booking.customerPhone);
        if (customer) {
          customer.loyaltyPoints += booking.totalAmount > 0 ? 1 : 0;
          customer.totalSpent += booking.totalAmount;
          customer.lastVisit = booking.date;
        }
      }
      
      await writeFirebase('bookings', bookings);
      await writeFirebase('customers', customers);

      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY + '_bookings', JSON.stringify(bookings));
        localStorage.setItem(MOCK_STORAGE_KEY + '_customers', JSON.stringify(customers));
      }
      return bookings[idx];
    }
  },

  getStats: async (): Promise<any> => {
    await ensureSeeded();
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    const customers = await readFirebase('customers', DEFAULT_MOCK_DATA.customers);

    const today = new Date().toISOString().split('T')[0];
    const activeBookings = bookings.filter(Boolean);
    const activeCustomers = customers.filter(Boolean);

    const bookingsToday = activeBookings.filter((b: any) => b.date === today && b.bookingStatus !== 'Cancelado').length;
    const totalCustomers = activeCustomers.length;
    
    const paidTodayBookings = activeBookings.filter((b: any) => b.date === today && b.paymentStatus === 'Pagado' && b.bookingStatus !== 'Cancelado');
    const earningsToday = paidTodayBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

    const currentMonth = today.substring(0, 7);
    const paidMonthBookings = activeBookings.filter((b: any) => b.date.startsWith(currentMonth) && b.paymentStatus === 'Pagado' && b.bookingStatus !== 'Cancelado');
    const earningsMonth = paidMonthBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

    return {
      bookingsToday,
      bookingsWeek: activeBookings.filter((b: any) => b.bookingStatus !== 'Cancelado').length,
      totalCustomers,
      earningsToday,
      earningsMonth,
      popularService: { name: "Lavado Premium", count: 12 },
      frequentCustomers: activeCustomers.sort((a: any, b: any) => b.totalSpent - a.totalSpent).slice(0, 5)
    };
  },

  // 3. SETTINGS
  getSettings: async (): Promise<any> => {
    await ensureSeeded();
    return await readFirebase('settings', DEFAULT_MOCK_DATA.settings);
  },

  saveSettings: async (settingsData: any): Promise<any> => {
    await ensureSeeded();
    const settings = await readFirebase('settings', DEFAULT_MOCK_DATA.settings);
    const updated = { ...settings, ...settingsData };
    await writeFirebase('settings', updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORAGE_KEY + '_settings', JSON.stringify(updated));
    }
    return updated;
  },

  // 4. PROMOTIONS
  getPromotions: async (): Promise<any[]> => {
    await ensureSeeded();
    const promotions = await readFirebase('promotions', DEFAULT_MOCK_DATA.promotions);
    return promotions.filter(Boolean);
  },

  validatePromoCode: async (code: string): Promise<any> => {
    await ensureSeeded();
    const promotions = await readFirebase('promotions', DEFAULT_MOCK_DATA.promotions);
    const promo = promotions.find((p: any) => p && p.code.toUpperCase() === code.toUpperCase() && p.active);
    if (promo) {
      return { valid: true, code: promo.code, discountPercent: promo.discountPercent, description: promo.description };
    }
    throw new Error('Cupón inválido');
  },

  // 5. REVIEWS
  getReviews: async (): Promise<any[]> => {
    await ensureSeeded();
    const reviews = await readFirebase('reviews', DEFAULT_MOCK_DATA.reviews);
    return reviews.filter((r: any) => r && r.approved);
  },

  getAdminReviews: async (): Promise<any[]> => {
    await ensureSeeded();
    const reviews = await readFirebase('reviews', DEFAULT_MOCK_DATA.reviews);
    return reviews.filter(Boolean);
  },

  approveReview: async (id: string, approved: boolean): Promise<any> => {
    await ensureSeeded();
    const reviews = await readFirebase('reviews', DEFAULT_MOCK_DATA.reviews);
    const idx = reviews.findIndex((r: any) => r && r.id === id);
    if (idx !== -1) {
      reviews[idx].approved = approved;
      await writeFirebase('reviews', reviews);
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY + '_reviews', JSON.stringify(reviews));
      }
      return reviews[idx];
    }
  },

  deleteReview: async (id: string): Promise<boolean> => {
    await ensureSeeded();
    const reviews = await readFirebase('reviews', DEFAULT_MOCK_DATA.reviews);
    const idx = reviews.findIndex((r: any) => r && r.id === id);
    if (idx !== -1) {
      reviews.splice(idx, 1);
      await writeFirebase('reviews', reviews);
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY + '_reviews', JSON.stringify(reviews));
      }
      return true;
    }
    return false;
  },

  createReview: async (reviewData: any): Promise<any> => {
    await ensureSeeded();
    const reviews = await readFirebase('reviews', DEFAULT_MOCK_DATA.reviews);
    const newReview = {
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      approved: false
    };
    reviews.push(newReview);
    await writeFirebase('reviews', reviews);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORAGE_KEY + '_reviews', JSON.stringify(reviews));
    }
    return newReview;
  },

  // 6. CUSTOMERS
  getCustomers: async (): Promise<any[]> => {
    await ensureSeeded();
    const customers = await readFirebase('customers', DEFAULT_MOCK_DATA.customers);
    return customers.filter(Boolean);
  },

  // 7. PAYMENTS
  getPayments: async (): Promise<any[]> => {
    await ensureSeeded();
    const bookings = await readFirebase('bookings', DEFAULT_MOCK_DATA.bookings);
    return bookings.filter(Boolean).map((b: any) => ({
      id: `pay-${b.id}`,
      bookingId: b.id,
      amount: b.totalAmount,
      method: b.paymentMethod,
      status: b.paymentStatus,
      date: new Date().toISOString(),
      booking: {
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        vehiclePlate: b.vehiclePlate,
        service: { name: b.serviceId === 'srv-basico' ? 'Lavado Básico' : b.serviceId === 'srv-premium' ? 'Lavado Premium' : 'Detailing Completo' }
      }
    }));
  },

  // 8. AUTHENTICATION
  login: async (username: string, password: string): Promise<any> => {
    if (username === 'admin' && password === 'admin123') {
      try {
        localStorage.setItem('detailing_admin_token', 'mock_jwt_token_admin_2026');
      } catch (_) {}
      return { username: 'admin', name: 'Admin Detailing Pro', role: 'admin' };
    }
    throw new Error('Credenciales inválidas');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('detailing_admin_token');
      } catch (_) {}
    }
  }
};
