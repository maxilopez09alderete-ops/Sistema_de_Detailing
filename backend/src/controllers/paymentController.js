// src/controllers/paymentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all payments (For Admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          select: {
            customerName: true,
            customerPhone: true,
            vehiclePlate: true,
            service: { select: { name: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error al obtener pagos.' });
  }
};

// Create a payment record manually
exports.createPaymentRecord = async (req, res) => {
  try {
    const { bookingId, amount, method, status, transactionId } = req.body;

    if (!bookingId || amount === undefined || !method || !status) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el pago.' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: parseFloat(amount),
        method,
        status,
        transactionId: transactionId || null
      }
    });

    // If payment is paid, update booking payment status as well
    if (status === 'Pagado') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'Pagado' }
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error registering manual payment:', error);
    res.status(500).json({ error: 'Error al registrar el pago.' });
  }
};

// Update an existing payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const existingPayment = await prisma.payment.findUnique({ where: { id } });
    if (!existingPayment) {
      return res.status(404).json({ error: 'Registro de pago no encontrado.' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        transactionId: transactionId || existingPayment.transactionId
      }
    });

    // Sync status to booking if it changed
    await prisma.booking.update({
      where: { id: existingPayment.bookingId },
      data: { paymentStatus: status }
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Error al actualizar el pago.' });
  }
};

// Mercado Pago Mock Integration Link
exports.createMercadoPagoPreference = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    // In a real implementation:
    // const preference = await mp.preferences.create({ items: [...] });
    // return res.json({ init_point: preference.init_point });
    
    // We simulate generating a checkout link
    const mockPreferenceId = `pref-mp-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockCheckoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mockPreferenceId}`;

    res.json({
      preferenceId: mockPreferenceId,
      checkoutUrl: mockCheckoutUrl,
      message: 'Preferencia de pago simulada creada con éxito.'
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    res.status(500).json({ error: 'Error al generar preferencia de Mercado Pago.' });
  }
};
