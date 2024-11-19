const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');

// Create a new season
router.post('/add', seasonController.createSeason);

// Get all seasons
router.get('/', seasonController.getAllSeasons);

// Get a single season by ID
router.get('/:id', seasonController.getSeasonById);

// Update a season by ID
router.put('/:id', seasonController.updateSeason);

// Delete a season by ID
router.delete('/:id', seasonController.deleteSeason);

module.exports = router;
