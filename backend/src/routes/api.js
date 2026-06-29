// src/routes/api.js
const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const serviceController = require('../controllers/serviceController');
const bookingController = require('../controllers/bookingController');
const customerController = require('../controllers/customerController');
const settingController = require('../controllers/settingController');
const promotionController = require('../controllers/promotionController');
const reviewController = require('../controllers/reviewController');
const paymentController = require('../controllers/paymentController');

// =========================================================================
// 1. AUTENTICACIÓN
// =========================================================================
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);

// =========================================================================
// 2. SERVICIOS
// =========================================================================
router.get('/services/public', serviceController.getPublicServices);
router.get('/services', authMiddleware, serviceController.getAdminServices);
router.post('/services', authMiddleware, serviceController.createService);
router.put('/services/:id', authMiddleware, serviceController.updateService);
router.delete('/services/:id', authMiddleware, serviceController.deleteService);

// =========================================================================
// 3. RESERVAS / AGENDA
// =========================================================================
router.get('/bookings/slots', bookingController.getAvailableSlots); // Public slots calculation
router.post('/bookings', bookingController.createBooking); // Client/Admin book
router.get('/bookings', authMiddleware, bookingController.getBookings); // Admin view
router.put('/bookings/:id', authMiddleware, bookingController.updateBooking); // Admin manage status
router.get('/bookings/stats', authMiddleware, bookingController.getDashboardStats); // Dashboard KPIs

// =========================================================================
// 4. CLIENTES
// =========================================================================
router.get('/customers', authMiddleware, customerController.getCustomers);
router.get('/customers/:id', authMiddleware, customerController.getCustomerById);
router.put('/customers/:id', authMiddleware, customerController.updateCustomer);
router.delete('/customers/:id', authMiddleware, customerController.deleteCustomer);

// =========================================================================
// 5. CONFIGURACIÓN DEL NEGOCIO
// =========================================================================
router.get('/settings', settingController.getSettings); // Public/Admin settings (e.g. active payment methods, hours)
router.put('/settings', authMiddleware, settingController.updateSetting);
router.put('/settings/batch', authMiddleware, settingController.updateBatchSettings);

// =========================================================================
// 6. PROMOCIONES Y CUPONES
// =========================================================================
router.post('/promotions/validate', promotionController.validatePromoCode); // Public check
router.get('/promotions', authMiddleware, promotionController.getPromotions);
router.post('/promotions', authMiddleware, promotionController.createPromotion);
router.put('/promotions/:id/toggle', authMiddleware, promotionController.togglePromotion);
router.delete('/promotions/:id', authMiddleware, promotionController.deletePromotion);

// =========================================================================
// 7. OPINIONES (REVIEWS)
// =========================================================================
router.get('/reviews/public', reviewController.getPublicReviews);
router.post('/reviews', reviewController.createReview); // Customer submit
router.get('/reviews', authMiddleware, reviewController.getAdminReviews);
router.put('/reviews/:id/approve', authMiddleware, reviewController.approveReview);
router.delete('/reviews/:id', authMiddleware, reviewController.deleteReview);

// =========================================================================
// 8. PAGOS
// =========================================================================
router.get('/payments', authMiddleware, paymentController.getPayments);
router.post('/payments/manual', authMiddleware, paymentController.createPaymentRecord);
router.put('/payments/:id', authMiddleware, paymentController.updatePaymentStatus);
router.post('/payments/mercadopago/preference', paymentController.createMercadoPagoPreference); // Public/Client generate URL

module.exports = router;
