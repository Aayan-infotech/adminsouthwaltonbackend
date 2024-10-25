const express = require('express');
const {createBookform , getAllBookforms,getBookformById, updateBookform, deleteBookform} = require('../controllers/checkoutController')
const router = express.Router();

router.post('/create',createBookform);
router.get('/', getAllBookforms);
router.get('/:id', getBookformById);
router.put('/:id', updateBookform);
router.delete('/:id', deleteBookform);


module.exports = router;
