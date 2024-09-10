const express = require('express');
const router = express.Router();
const heentController = require('../controllers/heentController');

// Route to create a new Heent document
router.post('/add', heentController.createHeent);

// Route to get all Heent documents
router.get('/', heentController.getAllHeents);

// Route to get a Heent document by ID
router.get('/:id', heentController.getHeentById);

// Route to update a Heent document by ID
router.put('/:id', heentController.updateHeentById);

// Route to delete a Heent document by ID
router.delete('/:id', heentController.deleteHeentById);

module.exports = router;
