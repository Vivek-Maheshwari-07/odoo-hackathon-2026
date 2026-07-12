// server/routes/bookingRoutes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/bookingController');

// Resources
router.get   ('/resources',      ctrl.getAllResources);
router.post  ('/resources',      ctrl.createResource);
router.put   ('/resources/:id',  ctrl.updateResource);
router.delete('/resources/:id',  ctrl.deleteResource);

// Bookings
router.get   ('/bookings',       ctrl.getAllBookings);
router.get   ('/bookings/:id',   ctrl.getBookingById);
router.post  ('/bookings',       ctrl.createBooking);
router.put   ('/bookings/:id',   ctrl.updateBooking);
router.delete('/bookings/:id',   ctrl.cancelBooking);

module.exports = router;
