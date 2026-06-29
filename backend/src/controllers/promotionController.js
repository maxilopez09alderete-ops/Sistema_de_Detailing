// src/controllers/promotionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all promotions
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Error al obtener promociones.' });
  }
};

// Validate a promo code
exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'El código de promoción es requerido.' });
    }

    const promo = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo || !promo.active) {
      return res.status(404).json({ error: 'Código de promoción inválido o inactivo.' });
    }

    // Check expiry if exists
    if (promo.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (promo.expiryDate < today) {
        return res.status(400).json({ error: 'El código de promoción ha expirado.' });
      }
    }

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      description: promo.description
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Error al validar el cupón.' });
  }
};

// Create a promo code
exports.createPromotion = async (req, res) => {
  try {
    const { code, description, discountPercent, expiryDate } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ error: 'El código y el porcentaje de descuento son requeridos.' });
    }

    const existing = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return res.status(400).json({ error: 'El código de promoción ya existe.' });
    }

    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        description: description || '',
        discountPercent: parseFloat(discountPercent),
        expiryDate: expiryDate || null,
        active: true
      }
    });

    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Error al crear la promoción.' });
  }
};

// Update active state of a promotion
exports.togglePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Promoción no encontrada.' });
    }

    const updated = await prisma.promotion.update({
      where: { id },
      data: { active: Boolean(active) }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling promotion:', error);
    res.status(500).json({ error: 'Error al actualizar promoción.' });
  }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promotion.delete({ where: { id } });
    res.json({ message: 'Promoción eliminada correctamente.' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Error al eliminar promoción.' });
  }
};
