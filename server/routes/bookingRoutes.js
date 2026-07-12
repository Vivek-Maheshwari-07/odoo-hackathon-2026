// server/routes/bookingRoutes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Resources
router.get   ('/resources',      authMiddleware, ctrl.getAllResources);
router.post  ('/resources',      authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), ctrl.createResource);
router.put   ('/resources/:id',  authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), ctrl.updateResource);
router.delete('/resources/:id',  authMiddleware, roleMiddleware(['Admin']), ctrl.deleteResource);

// Bookings
router.get   ('/bookings',       authMiddleware, ctrl.getAllBookings);
router.get   ('/bookings/:id',   authMiddleware, ctrl.getBookingById);
router.post  ('/bookings',       authMiddleware, ctrl.createBooking);
router.put   ('/bookings/:id',   authMiddleware, ctrl.updateBooking);
router.delete('/bookings/:id',   authMiddleware, ctrl.cancelBooking);

module.exports = router;
