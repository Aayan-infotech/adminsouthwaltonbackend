const express = require('express');
const {createBookform, getDriverBookings, getAvailableDriversByDropDate , getAllBookforms,getBookformById, updateBookform, deleteBookform} = require('../controllers/checkoutController')
const router = express.Router();

router.post('/create',createBookform);
router.get('/', getAllBookforms);
router.get('/:id', getBookformById);
router.put('/:id', updateBookform);
router.delete('/:id', deleteBookform);
router.post('/available-by-drop-date', getAvailableDriversByDropDate);

module.exports = router;
