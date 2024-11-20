const Season = require('../models/seasonModel');

// Create 
exports.createSeason = async (req, res) => {
    try {
        const { seasonName, offSeason, secondarySeason, peakSeason } = req.body;

        // Create a new season instance
        const newSeason = new Season({
            seasonName,
            offSeason,
            secondarySeason,
            peakSeason
        });

        // Save the season to the database
        const savedSeason = await newSeason.save();
        res.status(201).json({ message: 'Season created successfully', season: savedSeason });
    } catch (error) {
        res.status(500).json({ message: 'Error creating season', error: error.message });
    }
};

// add a new entry
exports.addSeasonEntry = async (req, res) => {
    const { seasonType, month, dateFrom, dateTo } = req.body;
    const { seasonId } = req.params;

    try {
        // Find season document
        const season = await Season.findById(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        // Validate season type
        const validSeasonTypes = ['offSeason', 'secondarySeason', 'peakSeason'];
        if (!validSeasonTypes.includes(seasonType)) {
            return res.status(400).json({ message: `Invalid season type. Must be one of: ${validSeasonTypes.join(', ')}` });
        }

        // Create new entry
        const newEntry = {
            month,
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
        };

        // Push new entry into the appropriate seasonType array
        season[seasonType].push(newEntry);

        // Save the updated season document
        await season.save();

        res.status(201).json({
            message: `New entry added to ${seasonType} successfully.`,
            updatedSeason: season[seasonType], // Return updated array only
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding season entry', error: error.message });
    }
};

// GetAll
exports.getAllSeasons = async (req, res) => {
    try {
        const seasons = await Season.find();
        res.status(200).json(seasons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seasons', error: error.message });
    }
};

// GetbyId
exports.getSeasonById = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        res.status(200).json(season);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching season', error: error.message });
    }
};

// Update
exports.updateSeason = async (req, res) => {
    const { seasonType, month, dateFrom, dateTo } = req.body;
    const { id } = req.params;

    try {
        const season = await Season.findOne();
        if (!season) return res.status(404).json({ message: 'Season not found' });

        const entryIndex = season[seasonType].findIndex(entry => entry._id.toString() === id);
        if (entryIndex === -1) return res.status(404).json({ message: 'Season entry not found' });

        season[seasonType][entryIndex] = { _id: id, month, dateFrom, dateTo };
        await season.save();

        res.json(season);
    } catch (error) {
        res.status(500).json({ message: 'Error updating season entry' });
    }
};

// Delete
exports.deleteSeason = async (req, res) => {
    try {
        const deletedSeason = await Season.findByIdAndDelete(req.params.id);

        if (!deletedSeason) {
            return res.status(404).json({ message: 'Season not found' });
        }

        res.status(200).json({ message: 'Season deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting season', error: error.message });
    }
};

