const express = require('express');
const router = express.Router();
const painController = require('../controllers/painController'); // Update the path as per your project structure

// Create a new pain entry
router.post('/add', painController.createPain);

// Get all pain entries
router.get('/', painController.getAllPains);

// Get a pain entry by ID
router.get('/:id', painController.getPainById);

// Update a pain entry by ID
router.put('/:id', painController.updatePainById);

// Delete a pain entry by ID
router.delete('/:id', painController.deletePainById);

module.exports = router;
