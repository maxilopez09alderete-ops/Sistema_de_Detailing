// src/controllers/serviceController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all active services (For clients)
exports.getPublicServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });
    
    // Parse "includes" back to Array
    const parsedServices = services.map(s => ({
      ...s,
      includes: s.includes ? JSON.parse(s.includes) : []
    }));
    
    res.json(parsedServices);
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({ error: 'Error al obtener los servicios.' });
  }
};

// Get all services including inactive (For Admin)
exports.getAdminServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { price: 'asc' }
    });
    
    const parsedServices = services.map(s => ({
      ...s,
      includes: s.includes ? JSON.parse(s.includes) : []
    }));
    
    res.json(parsedServices);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({ error: 'Error al obtener los servicios.' });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, durationMinutes, includes, imageUrl } = req.body;

    if (!name || !price || !durationMinutes) {
      return res.status(400).json({ error: 'Nombre, precio y duración son requeridos.' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes),
        includes: typeof includes === 'string' ? includes : JSON.stringify(includes || []),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
        active: true
      }
    });

    res.status(201).json({
      ...service,
      includes: JSON.parse(service.includes)
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Error al crear el servicio.' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, durationMinutes, includes, imageUrl, active } = req.body;

    const existingService = await prisma.service.findUnique({ where: { id } });
    if (!existingService) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingService.name,
        description: description !== undefined ? description : existingService.description,
        price: price !== undefined ? parseFloat(price) : existingService.price,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes) : existingService.durationMinutes,
        includes: includes !== undefined ? (typeof includes === 'string' ? includes : JSON.stringify(includes)) : existingService.includes,
        imageUrl: imageUrl !== undefined ? imageUrl : existingService.imageUrl,
        active: active !== undefined ? Boolean(active) : existingService.active
      }
    });

    res.json({
      ...updated,
      includes: JSON.parse(updated.includes)
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Error al actualizar el servicio.' });
  }
};

// Delete a service (Soft delete or hard delete. Let's do hard delete, or if booked, just deactivate)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { bookings: true }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    // If there are bookings associated, deactivate instead of delete to preserve references
    if (existingService.bookings.length > 0) {
      await prisma.service.update({
        where: { id },
        data: { active: false }
      });
      return res.json({ message: 'El servicio está asociado a turnos existentes, por lo que fue desactivado en lugar de eliminado.' });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Servicio eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Error al eliminar el servicio.' });
  }
};
