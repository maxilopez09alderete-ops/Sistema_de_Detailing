// src/controllers/reviewController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get approved reviews (For Landing Page)
exports.getPublicReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { date: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({ error: 'Error al obtener opiniones.' });
  }
};

// Get all reviews (For Admin)
exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Error al obtener opiniones.' });
  }
};

// Submit a review (From Client)
exports.createReview = async (req, res) => {
  try {
    const { customerName, rating, comment, vehicleImageBefore, vehicleImageAfter } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ error: 'Nombre, puntuación y comentario son obligatorios.' });
    }

    const ratingVal = parseInt(rating);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'La puntuación debe ser entre 1 y 5 estrellas.' });
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        rating: ratingVal,
        comment,
        date: new Date().toISOString().split('T')[0],
        vehicleImageBefore: vehicleImageBefore || null,
        vehicleImageAfter: vehicleImageAfter || null,
        approved: false // Must be approved by admin
      }
    });

    res.status(201).json({
      message: 'Opinión enviada. Será visible cuando el administrador la apruebe.',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Error al enviar la opinión.' });
  }
};

// Approve review
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Opinión no encontrada.' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { approved: Boolean(approved) }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Error al cambiar estado de la opinión.' });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Opinión eliminada.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error al eliminar la opinión.' });
  }
};
