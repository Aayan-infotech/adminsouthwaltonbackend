const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');


router.post('/add', seasonController.createSeason);

router.post('/:seasonId/add-entry', seasonController.addSeasonEntry);

router.get('/', seasonController.getAllSeasons);

router.get('/:id', seasonController.getSeasonById);

router.put('/:id', seasonController.updateSeason);

router.delete('/:id', seasonController.deleteSeason);

module.exports = router;
