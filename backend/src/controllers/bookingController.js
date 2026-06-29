// src/controllers/bookingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to convert HH:MM to minutes from midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to convert minutes from midnight to HH:MM
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Get Available Time Slots for a Date and Service
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ error: 'Parámetros date y serviceId son requeridos.' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    const duration = service.durationMinutes;

    // 1. Fetch settings
    const settings = await prisma.setting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch (_) {
        settingsMap[s.key] = s.value;
      }
    });

    const workingDays = settingsMap.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const workingHours = settingsMap.working_hours || { start: '09:00', end: '18:00' };
    const timeInterval = parseInt(settingsMap.time_interval || '60');
    const blockedSlots = settingsMap.blocked_slots || [{ type: 'recurring_daily', start: '12:00', end: '13:00', reason: 'Almuerzo' }];
    const blockedDates = settingsMap.blocked_dates || [];

    // 2. Check if date is blocked (holiday/vacation)
    if (blockedDates.includes(date)) {
      return res.json([]); // No slots on blocked dates
    }

    // 3. Check if day of the week is working day
    const dayOfWeek = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    if (!workingDays.includes(dayOfWeek)) {
      return res.json([]); // Closed on this weekday
    }

    // 4. Load all existing bookings for that date (excluding cancelled ones)
    const existingBookings = await prisma.booking.findMany({
      where: {
        date,
        bookingStatus: { not: 'Cancelado' }
      }
    });

    // 5. Calculate daily available intervals
    const startMinutes = timeToMinutes(workingHours.start);
    const endMinutes = timeToMinutes(workingHours.end);

    const availableSlots = [];

    // Loop through potential start times
    for (let current = startMinutes; current < endMinutes; current += timeInterval) {
      const slotStart = current;
      const slotEnd = current + duration;

      // Rule A: Slot must end before business close
      if (slotEnd > endMinutes) {
        continue;
      }

      let isBlocked = false;

      // Rule B: Check if slot overlaps with general lunch breaks or specific blocked slots
      for (const blocked of blockedSlots) {
        const blockStart = timeToMinutes(blocked.start);
        const blockEnd = timeToMinutes(blocked.end);

        // Overlap occurs if slotStart < blockEnd and slotEnd > blockStart
        if (slotStart < blockEnd && slotEnd > blockStart) {
          isBlocked = true;
          break;
        }
      }
      if (isBlocked) continue;

      // Rule C: Check if slot overlaps with existing appointments
      for (const booking of existingBookings) {
        const bStart = timeToMinutes(booking.startTime);
        const bEnd = timeToMinutes(booking.endTime);

        if (slotStart < bEnd && slotEnd > bStart) {
          isBlocked = true;
          break;
        }
      }
      if (isBlocked) continue;

      // If all checks pass, the starting time is available!
      availableSlots.push(minutesToTime(slotStart));
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Error calculating available slots:', error);
    res.status(500).json({ error: 'Error al calcular horarios disponibles.' });
  }
};

// Create a Booking (Client or Admin)
exports.createBooking = async (req, res) => {
  try {
    const {
      date,
      startTime,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleType,
      vehiclePlate,
      observations,
      paymentMethod,
      promoCode
    } = req.body;

    if (!date || !startTime || !serviceId || !customerName || !customerPhone || !vehiclePlate) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para crear la reserva.' });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    // Calculate end time
    const startMins = timeToMinutes(startTime);
    const endMins = startMins + service.durationMinutes;
    const endTime = minutesToTime(endMins);

    // Double check availability (concurrency safety)
    const existingBookings = await prisma.booking.findMany({
      where: {
        date,
        bookingStatus: { not: 'Cancelado' }
      }
    });

    for (const b of existingBookings) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      if (startMins < bEnd && endMins > bStart) {
        return res.status(400).json({ error: 'El horario seleccionado ya no está disponible.' });
      }
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          vehicleType: vehicleType || 'Sedan',
          vehiclePlate: vehiclePlate
        }
      });
    } else {
      // update plate/type/email if provided
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          email: customerEmail || customer.email,
          vehicleType: vehicleType || customer.vehicleType,
          vehiclePlate: vehiclePlate || customer.vehiclePlate
        }
      });
    }

    // Calculate Pricing & Loyalty discount
    let totalAmount = service.price;
    let loyaltyDiscountApplied = false;
    let discountAmount = 0;

    // Loyalty Rule: 10 washes completed = 11th free
    if (customer.loyaltyPoints >= 10) {
      totalAmount = 0;
      loyaltyDiscountApplied = true;
    } else {
      // Apply promo coupon if valid and loyalty is not applied
      if (promoCode) {
        const promo = await prisma.promotion.findUnique({
          where: { code: promoCode.toUpperCase() }
        });
        if (promo && promo.active) {
          const today = new Date().toISOString().split('T')[0];
          if (!promo.expiryDate || promo.expiryDate >= today) {
            discountAmount = (service.price * promo.discountPercent) / 100;
            totalAmount = service.price - discountAmount;
          }
        }
      }
    }

    const pointsEarned = loyaltyDiscountApplied ? 0 : 1;

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        date,
        startTime,
        endTime,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        vehicleType: vehicleType || 'Sedan',
        vehiclePlate: vehiclePlate.toUpperCase(),
        observations,
        paymentMethod,
        paymentStatus: paymentMethod === 'Efectivo' ? 'Pendiente' : 'Pendiente', // default until payment gateway completes
        bookingStatus: 'Pendiente',
        totalAmount,
        pointsEarned,
        serviceId,
        customerId: customer.id
      },
      include: { service: true }
    });

    // Create payment registry
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        method: paymentMethod,
        status: 'Pendiente'
      }
    });

    // Reset customer loyalty points if free wash was used
    if (loyaltyDiscountApplied) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          loyaltyPoints: 0
        }
      });
    }

    // Simulate Notification dispatch
    simulateNotification({
      type: 'CONFIRMACION',
      customerName,
      customerPhone,
      date,
      startTime,
      serviceName: service.name,
      totalAmount
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Error al crear la reserva de turno.' });
  }
};

// Get Bookings list (Filterable, for Admin Calendar / List)
exports.getBookings = async (req, res) => {
  try {
    const { start_date, end_date } = req.query; // Expecting YYYY-MM-DD
    
    const filters = {};
    if (start_date && end_date) {
      filters.date = {
        gte: start_date,
        lte: end_date
      };
    } else if (start_date) {
      filters.date = start_date;
    }

    const bookings = await prisma.booking.findMany({
      where: filters,
      include: { service: true },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Error al obtener reservas.' });
  }
};

// Update Booking Status / Edit Booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, startTime, date, notes } = req.body;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, customer: true }
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const updateData = {};
    
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes) updateData.observations = notes; // or notes field

    // If rescheduling
    if (date || startTime) {
      const finalDate = date || existingBooking.date;
      const finalStartTime = startTime || existingBooking.startTime;
      const startMins = timeToMinutes(finalStartTime);
      const endMins = startMins + existingBooking.service.durationMinutes;
      const finalEndTime = minutesToTime(endMins);

      // Verify no overlaps (excluding this booking itself)
      const dateBookings = await prisma.booking.findMany({
        where: {
          date: finalDate,
          id: { not: id },
          bookingStatus: { not: 'Cancelado' }
        }
      });

      for (const b of dateBookings) {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        if (startMins < bEnd && endMins > bStart) {
          return res.status(400).json({ error: 'El nuevo horario solicitado ya está ocupado.' });
        }
      }

      updateData.date = finalDate;
      updateData.startTime = finalStartTime;
      updateData.endTime = finalEndTime;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { service: true, customer: true }
    });

    // Update payment records status too
    if (paymentStatus) {
      await prisma.payment.updateMany({
        where: { bookingId: id },
        data: { status: paymentStatus }
      });
    }

    // Lógica adicional cuando el turno se finaliza
    if (bookingStatus === 'Finalizado' && existingBooking.bookingStatus !== 'Finalizado') {
      if (existingBooking.customer) {
        const totalBookings = await prisma.booking.count({
          where: { customerId: existingBooking.customerId, bookingStatus: 'Finalizado' }
        });
        
        // Add loyalty points if they didn't get this wash free
        let pointsToAdd = existingBooking.pointsEarned;
        
        await prisma.customer.update({
          where: { id: existingBooking.customerId },
          data: {
            loyaltyPoints: { increment: pointsToAdd },
            totalSpent: { increment: existingBooking.totalAmount },
            lastVisit: new Date()
          }
        });
      }

      // Notify customer that their vehicle is ready
      simulateNotification({
        type: 'COMPLETADO',
        customerName: existingBooking.customerName,
        customerPhone: existingBooking.customerPhone,
        date: existingBooking.date,
        startTime: existingBooking.startTime,
        serviceName: existingBooking.service.name,
        totalAmount: existingBooking.totalAmount
      });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Error al actualizar reserva de turno.' });
  }
};

// Admin Dashboard Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get start and end of current week
    const todayObj = new Date();
    const firstDay = new Date(todayObj.setDate(todayObj.getDate() - todayObj.getDay() + 1)).toISOString().split('T')[0]; // Mon
    const lastDay = new Date(todayObj.setDate(todayObj.getDate() - todayObj.getDay() + 7)).toISOString().split('T')[0];  // Sun

    // 1. Bookings Today
    const bookingsTodayCount = await prisma.booking.count({
      where: { date: today, bookingStatus: { not: 'Cancelado' } }
    });

    // 2. Bookings Week
    const bookingsWeekCount = await prisma.booking.count({
      where: {
        date: { gte: firstDay, lte: lastDay },
        bookingStatus: { not: 'Cancelado' }
      }
    });

    // 3. Customer Count
    const totalCustomers = await prisma.customer.count();

    // 4. Earnings Today (Sum finalizada and paid)
    const bookingsPaidToday = await prisma.booking.findMany({
      where: {
        date: today,
        paymentStatus: 'Pagado',
        bookingStatus: { not: 'Cancelado' }
      },
      select: { totalAmount: true }
    });
    const earningsToday = bookingsPaidToday.reduce((sum, b) => sum + b.totalAmount, 0);

    // 5. Earnings Month (June 2026 or current calendar month)
    const currentMonth = today.substring(0, 7); // "YYYY-MM"
    const bookingsPaidMonth = await prisma.booking.findMany({
      where: {
        date: { startsWith: currentMonth },
        paymentStatus: 'Pagado',
        bookingStatus: { not: 'Cancelado' }
      },
      select: { totalAmount: true }
    });
    const earningsMonth = bookingsPaidMonth.reduce((sum, b) => sum + b.totalAmount, 0);

    // 6. Most requested service
    const serviceCounts = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { bookingStatus: { not: 'Cancelado' } },
      _count: {
        id: true
      }
    });

    let popularService = { name: 'N/A', count: 0 };
    if (serviceCounts.length > 0) {
      serviceCounts.sort((a, b) => b._count.id - a._count.id);
      const topService = await prisma.service.findUnique({
        where: { id: serviceCounts[0].serviceId }
      });
      if (topService) {
        popularService = {
          name: topService.name,
          count: serviceCounts[0]._count.id
        };
      }
    }

    // 7. Frequent Customers (top 5)
    const frequentCustomers = await prisma.customer.findMany({
      take: 5,
      orderBy: {
        totalSpent: 'desc'
      },
      select: {
        name: true,
        phone: true,
        totalSpent: true,
        loyaltyPoints: true
      }
    });

    // 8. Weekly schedule array (for small graph showing work distribution)
    const activeBookings = await prisma.booking.findMany({
      where: {
        date: { gte: firstDay, lte: lastDay },
        bookingStatus: { not: 'Cancelado' }
      },
      select: { date: true, totalAmount: true }
    });

    res.json({
      bookingsToday: bookingsTodayCount,
      bookingsWeek: bookingsWeekCount,
      totalCustomers,
      earningsToday,
      earningsMonth,
      popularService,
      frequentCustomers,
      weeklySummary: activeBookings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del panel.' });
  }
};

// Simulated Notification Log
function simulateNotification({ type, customerName, customerPhone, date, startTime, serviceName, totalAmount }) {
  console.log('--- SIMULACION DE NOTIFICACION ENVIADA ---');
  console.log(`Destinatario: ${customerName} (${customerPhone})`);
  
  if (type === 'CONFIRMACION') {
    console.log(`Canal: WhatsApp & Email`);
    console.log(`Mensaje: "¡Hola ${customerName}! Tu turno para el servicio de '${serviceName}' el día ${date} a las ${startTime} hs ha sido registrado. El monto estimado es de $${totalAmount}. ¡Te esperamos en Detailing Pro!"`);
  } else if (type === 'COMPLETADO') {
    console.log(`Canal: WhatsApp`);
    console.log(`Mensaje: "¡Hola ${customerName}! Te avisamos que el trabajo de detailing en tu vehículo ha finalizado con éxito y ya está listo para retirar. Total abonado: $${totalAmount}. ¡Gracias por confiar en nosotros!"`);
  }
  console.log('-----------------------------------------');
}
