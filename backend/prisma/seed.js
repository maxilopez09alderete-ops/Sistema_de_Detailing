// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      email: 'admin@detailingpro.com',
      name: 'Admin Detailing Pro',
      role: 'admin',
    },
  });
  console.log('Admin user seeded:', admin.username);

  // 2. Create Default Services
  const servicesData = [
    {
      name: 'Lavado Básico',
      description: 'Limpieza rápida y efectiva para mantener tu auto impecable.',
      price: 2500,
      durationMinutes: 60,
      includes: JSON.stringify([
        'Lavado exterior con shampoo pH neutro',
        'Aspirado completo del interior',
        'Secado con microfibra anti-rayas',
        'Acondicionado básico de cubiertas'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Lavado Premium',
      description: 'Limpieza detallada exterior e interior ideal para un mantenimiento completo.',
      price: 5000,
      durationMinutes: 120,
      includes: JSON.stringify([
        'Todo lo del Lavado Básico',
        'Limpieza profunda de llantas y pasarruedas',
        'Acondicionado completo de interiores (plásticos, tableros)',
        'Aplicación de cera rápida de carnauba para brillo y protección'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Detailing Completo',
      description: 'Restauración completa, pulido de pintura y protección cerámica premium.',
      price: 18000,
      durationMinutes: 360,
      includes: JSON.stringify([
        'Todo lo del Lavado Premium',
        'Lavado a detalle con técnica de dos baldes',
        'Descontaminado físico (Claybar) y químico de pintura',
        'Pulido de corrección de pintura (elimina rayas finas/swirls)',
        'Protección sellador cerámico (duración de 12 meses)',
        'Limpieza profunda y desinfección del interior con extractor de vapor',
        'Restauración y acondicionamiento de plásticos exteriores con protección UV'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    }
  ];

  const services = [];
  for (const s of servicesData) {
    const service = await prisma.service.create({
      data: s,
    });
    services.push(service);
  }
  console.log('Services seeded:', services.length);

  // 3. Create Default Settings
  const settingsData = [
    {
      key: 'working_days',
      value: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
    },
    {
      key: 'working_hours',
      value: JSON.stringify({ start: '09:00', end: '18:00' }),
    },
    {
      key: 'time_interval',
      value: '60', // 30, 60, 120 minutes
    },
    {
      key: 'active_payments',
      value: JSON.stringify({
        cash: true,
        transfer: true,
        mercadopago: true,
        credit: true,
        debit: true,
      }),
    },
    {
      key: 'blocked_slots',
      value: JSON.stringify([
        { type: 'recurring_daily', start: '12:00', end: '13:00', reason: 'Almuerzo' }
      ]), // slots block
    },
    {
      key: 'blocked_dates',
      value: JSON.stringify([]), // e.g. ["2026-07-09"] holiday
    }
  ];

  for (const set of settingsData) {
    await prisma.setting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: set,
    });
  }
  console.log('Business settings seeded');

  // 4. Create Mock Promotions
  await prisma.promotion.create({
    data: {
      code: 'BIENVENIDA10',
      description: '10% de descuento en tu primer servicio de detailing',
      discountPercent: 10,
      active: true,
    }
  });

  await prisma.promotion.create({
    data: {
      code: 'WINTERGLOW',
      description: '15% de descuento especial invierno',
      discountPercent: 15,
      active: true,
    }
  });
  console.log('Promotions seeded');

  // 5. Create Mock Customers
  const customersData = [
    {
      name: 'Carlos Gómez',
      phone: '+5491122334455',
      email: 'carlos.gomez@gmail.com',
      vehicleType: 'Sedan',
      vehiclePlate: 'AE123MZ',
      loyaltyPoints: 3,
      totalSpent: 7500,
    },
    {
      name: 'María Rodríguez',
      phone: '+5491155667788',
      email: 'maria.rod@hotmail.com',
      vehicleType: 'SUV',
      vehiclePlate: 'AD456OP',
      loyaltyPoints: 1,
      totalSpent: 5000,
    },
    {
      name: 'Lucía Fernández',
      phone: '+5491133445566',
      email: 'lucia.f@gmail.com',
      vehicleType: 'Pickup',
      vehiclePlate: 'AF789QR',
      loyaltyPoints: 10, // Eligible for a free service!
      totalSpent: 28000,
    }
  ];

  const customers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: c,
    });
    customers.push(cust);
  }
  console.log('Customers seeded:', customers.length);

  // 6. Create Mock Reviews
  const reviewsData = [
    {
      customerName: 'Carlos Gómez',
      rating: 5,
      comment: 'Excelente el lavado premium. Sacaron todas las manchas de los asientos de tela y las llantas quedaron brillantes. Muy recomendado!',
      date: '2026-06-25',
      approved: true,
    },
    {
      customerName: 'Lucía Fernández',
      rating: 5,
      comment: 'Hice el Detailing Completo y sellador cerámico. Mi camioneta parece recién sacada de la concesionaria. Increíble atención al detalle.',
      date: '2026-06-20',
      approved: true,
    },
    {
      customerName: 'Juan Pérez',
      rating: 4,
      comment: 'Muy buen servicio y puntualidad. Volveré seguro.',
      date: '2026-06-28',
      approved: true,
    }
  ];

  for (const r of reviewsData) {
    await prisma.review.create({
      data: r,
    });
  }
  console.log('Reviews seeded');

  // 7. Create Mock Bookings
  // We'll calculate mock dates based on today's date (2026-06-29)
  const todayStr = '2026-06-29';
  const tomorrowStr = '2026-06-30';
  const yesterdayStr = '2026-06-28';

  const mockBookings = [
    {
      date: yesterdayStr,
      startTime: '10:00',
      endTime: '12:00',
      customerName: 'Carlos Gómez',
      customerPhone: '+5491122334455',
      customerEmail: 'carlos.gomez@gmail.com',
      vehicleType: 'Sedan',
      vehiclePlate: 'AE123MZ',
      observations: 'Tiene pelos de perro en los asientos traseros.',
      paymentMethod: 'Transferencia',
      paymentStatus: 'Pagado',
      bookingStatus: 'Finalizado',
      totalAmount: 5000,
      pointsEarned: 1,
      serviceId: services[1].id, // Lavado Premium
      customerId: customers[0].id,
    },
    {
      date: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      customerName: 'Juan Pérez',
      customerPhone: '+5491199887766',
      customerEmail: 'juan.perez@gmail.com',
      vehicleType: 'Sedan',
      vehiclePlate: 'AD999ZZ',
      observations: 'Lavado rápido por favor.',
      paymentMethod: 'Efectivo',
      paymentStatus: 'Pagado',
      bookingStatus: 'Finalizado',
      totalAmount: 2500,
      pointsEarned: 1,
      serviceId: services[0].id, // Lavado Básico
    },
    {
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      customerName: 'María Rodríguez',
      customerPhone: '+5491155667788',
      customerEmail: 'maria.rod@hotmail.com',
      vehicleType: 'SUV',
      vehiclePlate: 'AD456OP',
      observations: 'Limpieza profunda del baúl que tiene una mancha de aceite.',
      paymentMethod: 'Mercado Pago',
      paymentStatus: 'Pagado',
      bookingStatus: 'Confirmado',
      totalAmount: 5000,
      pointsEarned: 1,
      serviceId: services[1].id, // Lavado Premium
      customerId: customers[1].id,
    },
    {
      date: tomorrowStr,
      startTime: '09:00',
      endTime: '15:00',
      customerName: 'Lucía Fernández',
      customerPhone: '+5491133445566',
      customerEmail: 'lucia.f@gmail.com',
      vehicleType: 'Pickup',
      vehiclePlate: 'AF789QR',
      observations: 'Tiene bastante barro abajo, estuvo en el campo. Tratamiento cerámico.',
      paymentMethod: 'Tarjeta Credito',
      paymentStatus: 'Pendiente',
      bookingStatus: 'Pendiente',
      totalAmount: 18000,
      pointsEarned: 2,
      serviceId: services[2].id, // Detailing Completo
      customerId: customers[2].id,
    }
  ];

  for (const b of mockBookings) {
    const createdBooking = await prisma.booking.create({
      data: b,
    });
    // Create payment registry
    await prisma.payment.create({
      data: {
        bookingId: createdBooking.id,
        amount: b.totalAmount,
        method: b.paymentMethod,
        status: b.paymentStatus,
        transactionId: b.paymentStatus === 'Pagado' ? `TX-${Math.floor(100000 + Math.random() * 900000)}` : null,
      }
    });
  }

  console.log('Mock Bookings and Payments seeded');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
