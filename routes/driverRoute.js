const express = require("express");
const Driver = require('../models/driverModel');
const { createDriver, assignDriver, getAllDrivers,getDriverBookings, getDriverById, updateDriverById, deleteDriver, getImage ,driverLogin, driverLogout} = require('../controllers/driverController');
const { verifyAdmin } = require('../middleware/verifyToken');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/add', upload.single('image'), verifyAdmin, createDriver); 
router.get('/', verifyAdmin, getAllDrivers);  
router.get('/:id', verifyAdmin, getDriverById); 
router.put('/:id', upload.single('image'), verifyAdmin, updateDriverById);      
router.delete('/:id', verifyAdmin, deleteDriver);  
router.get('/image/:filename', getImage); 
// Driver Login
router.post('/login',verifyAdmin, driverLogin);
router.put('/assignDriver/:id',assignDriver);
router.get('/:driverId/bookings', getDriverBookings);

// Driver Logout
router.post('/logout', driverLogout);


module.exports = router;