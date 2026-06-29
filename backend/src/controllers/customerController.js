// src/controllers/customerController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all customers (For Admin)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          select: {
            id: true,
            date: true,
            totalAmount: true,
            bookingStatus: true,
            service: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error al obtener clientes.' });
  }
};

// Get a single customer history
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            service: true
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Error al obtener detalles del cliente.' });
  }
};

// Update customer details (e.g. adjust loyalty points or notes)
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, vehicleType, vehiclePlate, loyaltyPoints } = req.body;

    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingCustomer.name,
        email: email !== undefined ? email : existingCustomer.email,
        vehicleType: vehicleType !== undefined ? vehicleType : existingCustomer.vehicleType,
        vehiclePlate: vehiclePlate !== undefined ? vehiclePlate : existingCustomer.vehiclePlate,
        loyaltyPoints: loyaltyPoints !== undefined ? parseInt(loyaltyPoints) : existingCustomer.loyaltyPoints
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Error al actualizar el cliente.' });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: { bookings: true }
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Set customerId to null in all bookings to preserve booking data, or restrict deletion
    if (existingCustomer.bookings.length > 0) {
      await prisma.booking.updateMany({
        where: { customerId: id },
        data: { customerId: null }
      });
    }

    await prisma.customer.delete({ where: { id } });
    res.json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Error al eliminar el cliente.' });
  }
};
